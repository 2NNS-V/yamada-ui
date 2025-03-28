import type {
  ComponentArgs,
  CSSUIObject,
  HTMLUIProps,
  ThemeProps,
} from "@yamada-ui/core"
import type { ForwardedRef, ReactElement, RefAttributes } from "react"
import {
  forwardRef,
  omitThemeProps,
  ui,
  useComponentMultiStyle,
} from "@yamada-ui/core"
import { Ripple, useRipple } from "@yamada-ui/ripple"
import { useControllableState } from "@yamada-ui/use-controllable-state"
import {
  cx,
  dataAttr,
  handlerAll,
  isArray,
  isUndefined,
} from "@yamada-ui/utils"
import { useMemo } from "react"
import { useToggleGroup } from "./toggle-group"

interface ToggleOptions<Y extends number | string = string> {
  /**
   * If `true`, the toggle button is represented as active.
   *
   * @default false
   */
  active?: boolean
  /**
    *If `true`, the toggle button will be initially selected.
   *
  @default false

  @deprecated Use `defaultSelected` instead.
   */
  defaultIsSelected?: boolean
  /**
    *If `true`, the toggle button will be initially selected.
   *
  @default false
   */
  defaultSelected?: boolean
  /**
   * If `true`, the toggle button will be disabled.
   *
   * @default false
   */
  disabled?: boolean
  /**
   * If `true`, disable ripple effects when pressing a element.
   *
   * @default false
   */
  disableRipple?: boolean
  /**
   * If true, the toggle button is full rounded. Else, it'll be slightly round.
   *
   * @default false
   */
  fullRounded?: boolean
  /**
   * The icon to be used in the button.
   */
  icon?: ReactElement
  /**
   * If `true`, the toggle button is represented as active.
   *
   * @default false
   *
   * @deprecated Use `active` instead.
   */
  isActive?: boolean
  /**
   * If `true`, the toggle button will be disabled.
   *
   * @default false
   *
   * @deprecated Use `disabled` instead.
   */
  isDisabled?: boolean
  /**
   * If `true`, the toggle button will be readonly.
   *
   * @default false
   *
   * @deprecated Use `readOnly` instead.
   */
  isReadOnly?: boolean
  /**
   * If true, the toggle button is full rounded. Else, it'll be slightly round.
   *
   * @default false
   *
   * @deprecated Use `fullRounded` instead.
   */
  isRounded?: boolean
  /**
   * If `true`, the toggle button will be selected.
   *
   * @deprecated Use `selected` instead.
   */
  isSelected?: boolean
  /**
   * If `true`, the toggle button will be readonly.
   *
   * @default false
   */
  readOnly?: boolean
  /**
   * If `true`, the toggle button will be selected.
   */
  selected?: boolean
  /**
   * The value of the toggle button.
   */
  value?: Y
  /**
   * The callback invoked when selected state changes.
   */
  onChange?: (isSelected: boolean) => void
}

export interface ToggleProps<Y extends number | string = string>
  extends Omit<HTMLUIProps<"button">, "onChange" | "value">,
    ThemeProps<"Toggle">,
    ToggleOptions<Y> {}

/**
 * `Toggle` is a two-state button that can be either on or off.
 *
 * @see Docs https://yamada-ui.com/components/forms/toggle
 */
export const Toggle = forwardRef(
  <Y extends number | string = string>(
    props: ToggleProps<Y>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const {
      controlled: controlled,
      disabled: groupDisabled,
      readOnly: groupReadOnly,
      value: groupValue,
      onChange: onChangeGroup,
      ...group
    } = useToggleGroup() ?? {}
    const [styles, mergedProps] = useComponentMultiStyle("Toggle", {
      ...group,
      isDisabled: groupDisabled,
      isReadOnly: groupReadOnly,
      ...props,
    })
    let {
      className,
      active,
      children,
      defaultIsSelected = false,
      defaultSelected,
      disabled,
      disableRipple,
      fullRounded,
      icon,
      isActive,
      isDisabled = groupDisabled,
      isReadOnly = groupReadOnly,
      isRounded,
      isSelected: isSelectedProp,
      readOnly,
      selected,
      value,
      onChange,
      ...rest
    } = omitThemeProps(mergedProps)

    disabled ??= isDisabled
    readOnly ??= isReadOnly
    active ??= isActive
    selected ??= isSelectedProp
    fullRounded ??= isRounded
    defaultSelected ??= defaultIsSelected

    const [isSelected, setIsSelected] = useControllableState({
      defaultValue: defaultSelected,
      value: selected,
      onChange,
    })

    if (controlled && isUndefined(value)) {
      console.warn(`Toggle: value is required. Please set the value.`)
    }

    const multi = isArray(groupValue)
    const included = multi
      ? groupValue.includes(value ?? "")
      : value === groupValue
    const trulySelected = controlled ? included : isSelected
    const { onPointerDown, ...rippleProps } = useRipple({
      ...rest,
      disabled: disableRipple || disabled,
    })

    const onClick = () => {
      setIsSelected((prev) => !prev)
      onChangeGroup?.(value)
    }

    const css: CSSUIObject = useMemo(
      () => ({
        alignItems: "center",
        appearance: "none",
        display: "inline-flex",
        gap: "fallback(2, 0.5rem)",
        justifyContent: "center",
        outline: "none",
        overflow: "hidden",
        pointerEvents: readOnly ? "none" : "auto",
        position: "relative",
        userSelect: "none",
        verticalAlign: "middle",
        ...styles,
        ...(fullRounded ? { borderRadius: "fallback(full, 9999px)" } : {}),
      }),
      [fullRounded, styles, readOnly],
    )

    return (
      <ui.button
        ref={ref}
        type="button"
        className={cx("ui-toggle", className)}
        aria-pressed={trulySelected}
        data-active={dataAttr(active)}
        data-readonly={dataAttr(readOnly)}
        data-selected={dataAttr(trulySelected)}
        disabled={disabled}
        tabIndex={readOnly ? -1 : 0}
        __css={css}
        {...rest}
        onClick={handlerAll(rest.onClick, onClick)}
        onPointerDown={onPointerDown}
      >
        {children || icon}

        <Ripple {...rippleProps} />
      </ui.button>
    )
  },
) as {
  <Y extends number | string = string>(
    props: RefAttributes<HTMLButtonElement> & ToggleProps<Y>,
  ): ReactElement
} & ComponentArgs

Toggle.displayName = "Toggle"
Toggle.__ui__ = "Toggle"
