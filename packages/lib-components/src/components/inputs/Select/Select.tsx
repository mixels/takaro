// TODO: implement required, test error display, add grouped example, implement setShowError
import {
  FC,
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  useLayoutEffect,
  PropsWithChildren,
} from 'react';
import { AiOutlineDown as ArrowIcon } from 'react-icons/ai';
import { SelectContext } from './context';
import { GroupLabel, SelectButton, SelectContainer, Container } from './style';
import { Label, ErrorMessage } from '../../../components';

import {
  useFloating,
  offset,
  flip,
  useListNavigation,
  useTypeahead,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  FloatingFocusManager,
  autoUpdate,
  FloatingOverlay,
  size,
} from '@floating-ui/react';

import {
  InputProps,
  defaultInputPropsFactory,
  defaultInputProps,
} from '../InputProps';

export interface SelectProps extends InputProps {
  render: (selectedIndex: number) => React.ReactNode;
}

export interface GenericSelectProps extends SelectProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<PropsWithChildren<GenericSelectProps>>(
    defaultInputProps
  );

// TODO: implement **required** (but this should only be done after the label reimplementation.
export const GenericSelect: FC<PropsWithChildren<GenericSelectProps>> = (
  props
) => {
  const {
    required,
    size: componentSize,
    label,
    render,
    children,
    readOnly,
    disabled,
    hint,
    error,
    value,
    onBlur,
    onChange,
    loading,
  } = defaultsApplier(props);

  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const listContentRef = useRef([
    'Select...',
    ...(Children.map(children, (child) =>
      Children.map(
        isValidElement(child) && child.props.children,
        (child) => child.props.value
      )
    ) ?? []),
  ]);

  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, listContentRef.current.indexOf(value))
  );

  const [pointer, setPointer] = useState(false);

  if (!open && pointer) {
    setPointer(false);
  }

  const handleOnBlur = () => {
    onBlur();
    setShowError(false);
  };

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({ fallbackPlacements: ['top', 'bottom'] }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`, // based on the width of currently selected element
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useRole(context, { role: 'listbox' }),
      useDismiss(context),
      useListNavigation(context, {
        listRef: listItemsRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
      }),
      useTypeahead(context, {
        listRef: listContentRef,
        onMatch: open ? setActiveIndex : setSelectedIndex,
        activeIndex,
        selectedIndex,
      }),
    ]
  );

  // Scroll the active or selected item into view when in `controlledScrolling`
  // mode (i.e. arrow key nav).
  useLayoutEffect(() => {
    if (open && activeIndex != null && !pointer) {
      requestAnimationFrame(() => {
        listItemsRef.current[activeIndex]?.scrollIntoView({
          block: 'nearest',
        });
      });
    }
  }, [open, activeIndex, pointer]);

  let optionIndex = 0;

  const options = [
    ...(Children.map(
      children,
      (child) =>
        isValidElement(child) && (
          <ul
            key={child.props.label}
            role="group"
            aria-labelledby={`select-${child.props.label}`}
          >
            <GroupLabel
              role="presentation"
              id={`select-${child.props.label}`}
              aria-hidden="true"
            >
              {child.props.label}
            </GroupLabel>
            {Children.map(child.props.children, (child) =>
              cloneElement(child, {
                index: 1 + optionIndex++,
                onChange: onChange,
              })
            )}
          </ul>
        )
    ) ?? []),
  ];

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <SelectContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        activeIndex,
        setActiveIndex,
        listRef: listItemsRef,
        setOpen,
        getItemProps,
        dataRef: context.dataRef,
      }}
    >
      <Container>
        {label && (
          <Label
            error={!!error}
            text={label}
            required={required}
            position="top"
            size={componentSize}
            disabled={disabled}
            hint={hint}
            onClick={() => {
              setOpen(!open);
            }}
          />
        )}
        <SelectButton
          {...getReferenceProps({
            ref: reference,
          })}
          readOnly={readOnly}
          onBlur={handleOnBlur}
        >
          {render(selectedIndex - 1)}
          {!readOnly && <ArrowIcon size={18} />}
        </SelectButton>

        {error && showError && <ErrorMessage message={error} />}
        {open && !readOnly && (
          <FloatingOverlay lockScroll style={{ zIndex: 1000 }}>
            <FloatingFocusManager
              context={context}
              initialFocus={selectedIndex}
            >
              <SelectContainer
                {...getFloatingProps({
                  ref: floating,
                  style: {
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
                    overflow: 'auto',
                  },
                  onPointerMove() {
                    setPointer(true);
                  },
                  onKeyDown(event) {
                    setPointer(false);
                    if (event.key === 'Tab') {
                      setOpen(false);
                    }
                  },
                })}
              >
                {options}
              </SelectContainer>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </Container>
    </SelectContext.Provider>
  );
};
