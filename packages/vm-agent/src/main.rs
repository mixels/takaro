use std::{io, net::Ipv4Addr};

use anyhow::Error;
use futures::TryStreamExt;
use tokio_vsock::VsockListener;

const HOST: u32 = libc::VMADDR_CID_ANY;
const PORT: u32 = 8000;

#[derive(Debug, thiserror::Error)]
enum InitError {
    #[error("an unhandled IO error occurred: {}", 0)]
    UnhandledIoError(#[from] io::Error),

    #[error("an unhandled netlink error occurred: {}", 0)]
    UnhandledNetlinkError(#[from] rtnetlink::Error),

    #[error("an unhandled error occurred: {}", 0)]
    UnhandledError(#[from] Error),
}

async fn setup_network() -> Result<(), InitError> {
    let (connection, handle, _) = rtnetlink::new_connection().unwrap();

    tokio::spawn(connection);

    let guest_ip = Ipv4Addr::new(172, 16, 0, 2);
    let gateway = Ipv4Addr::new(172, 16, 0, 1);
    let any_addr = Ipv4Addr::UNSPECIFIED;

    tracing::debug!("netlink: getting eth0 link");

    let eth0 = handle
        .link()
        .get()
        .match_name("eth0".into())
        .execute()
        .try_next()
        .await?
        .expect("no eth0 link found");

    tracing::debug!("netlink: add guest ip to eth0");

    handle
        .address()
        .add(eth0.header.index, guest_ip.into(), 24)
        .execute()
        .await?;

    tracing::debug!("netlink: setting eth0 link up");

    handle.link().set(eth0.header.index).up().execute().await?;

    tracing::debug!("netlink: adds a default route for all addresses via the host ip");

    handle
        .route()
        .add()
        .input_interface(eth0.header.index)
        .v4()
        .destination_prefix(any_addr, 0)
        .gateway(gateway)
        .execute()
        .await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), InitError> {
    tracing_subscriber::fmt().init();

    setup_network().await?;

    let listener = VsockListener::bind(HOST, PORT).expect("bind failed");

    tracing::info!("listening on {HOST}:{PORT}");

    vm_agent::api::server(listener).await.unwrap();

    Ok(())
}
