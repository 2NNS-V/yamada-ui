import type { CSSUIObject, FC, HTMLUIProps } from "@yamada-ui/core"
import type {
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  ReactElement,
} from "react"
import { forwardRef, ui } from "@yamada-ui/core"
import { useClickable } from "@yamada-ui/use-clickable"
import {
  cx,
  dataAttr,
  funcAll,
  handlerAll,
  isActiveElement,
  isHTMLElement,
  mergeRefs,
  useUpdateEffect,
} from "@yamada-ui/utils"
import { useCallback, useId, useRef, useState } from "react"
import {
  UpstreamMenuItemProvider,
  useMenu,
  useMenuDescendant,
  useUpstreamMenuItem,
} from "./menu-context"

const isTargetMenuItem = (target: EventTarget | null) => {
  return (
    isHTMLElement(target) &&
    !!target.getAttribute("role")?.startsWith("menuitem")
  )
}

interface MenuItemOptions {
  /**
   * If `true`, the list element will be closed when selected.
   *
   * @default false
   */
  closeOnSelect?: boolean
  /**
   * Right-aligned label text content, useful for displaying hotkeys.
   */
  command?: string
  /**
   * The menu item icon to use.
   */
  icon?: ReactElement
  /**
   * If `true`, the menu item will be disabled.
   *
   * @default false
   */
  isDisabled?: boolean
  /**
   * If `true`, the menu item will be focusable.
   *
   * @default false
   */
  isFocusable?: boolean
}

export interface MenuItemProps extends HTMLUIProps, MenuItemOptions {}

export const MenuItem = forwardRef<MenuItemProps, "div">(
  (
    {
      id,
      className,
      children,
      closeOnSelect: customCloseOnSelect,
      command,
      icon,
      isDisabled,
      isFocusable,
      ...props
    },
    ref,
  ) => {
    const {
      closeOnSelect,
      focusedIndex,
      isNested,
      isOpen,
      menuRef,
      requestAnimationFrameId,
      setFocusedIndex,
      styles,
      onClose,
      onUpstreamClose,
    } = useMenu()
    const { onUpstreamRestoreFocus } = useUpstreamMenuItem() ?? {}
    const [isDownstreamOpen, setDownstreamOpen] = useState<boolean>(false)
    const uuid = useId()
    const itemRef = useRef<HTMLDivElement>(null)
    const hasDownstreamRef = useRef<boolean>(false)
    const onKeyDownRef = useRef<KeyboardEventHandler<HTMLDivElement>>(
      () => void 0,
    )

    id ??= uuid

    const trulyDisabled = isDisabled && !isFocusable
    const type = itemRef.current?.getAttribute("type")
    const role = !!type
      ? type === "checkbox"
        ? "menuitemcheckbox"
        : "menuitemradio"
      : "menuitem"

    const { index, register } = useMenuDescendant({ disabled: trulyDisabled })

    const isFocused = index === focusedIndex

    const onMouseOver = useCallback(() => {
      if (isDisabled) return

      setFocusedIndex(index)
    }, [index, isDisabled, setFocusedIndex])

    const onMouseLeave = useCallback(() => {
      if (isDisabled) return

      setFocusedIndex(-1)
    }, [setFocusedIndex, isDisabled])

    const onClick = useCallback(
      (ev: MouseEvent<HTMLDivElement>) => {
        if (!isTargetMenuItem(ev.currentTarget)) return

        const hasDownstream = hasDownstreamRef.current

        if (customCloseOnSelect ?? (!hasDownstream && closeOnSelect)) {
          onClose()
          onUpstreamClose?.()
        }
      },
      [customCloseOnSelect, closeOnSelect, onClose, onUpstreamClose],
    )

    const onFocus = useCallback(() => {
      setFocusedIndex(index)
    }, [setFocusedIndex, index])

    const onRestoreFocus = useCallback(() => {
      itemRef.current?.focus()

      setFocusedIndex(index)
    }, [setFocusedIndex, index])

    const onKeyDown = useCallback(
      (ev: KeyboardEvent<HTMLDivElement>) => {
        if (ev.key === " ") ev.key = ev.code

        const actions: { [key: string]: Function | undefined } = {
          ArrowLeft: isNested
            ? funcAll(onUpstreamRestoreFocus, onClose)
            : undefined,
          Space: !hasDownstreamRef.current
            ? funcAll(onUpstreamClose, onClose)
            : undefined,
        }

        const action = actions[ev.key]

        if (!action) return

        ev.preventDefault()
        ev.stopPropagation()

        action()
      },
      [isNested, onUpstreamRestoreFocus, onClose, onUpstreamClose],
    )

    const rest = useClickable<HTMLDivElement>({
      clickOnSpace: false,
      focusOnClick: false,
      ...props,
      ref: mergeRefs(register, itemRef, ref),
      isDisabled,
      isFocusable,
      onClick: handlerAll(props.onClick, onClick),
      onFocus: handlerAll(props.onFocus, onFocus),
      onKeyDown: handlerAll(props.onKeyDown, onKeyDown, onKeyDownRef.current),
      onMouseLeave: handlerAll(props.onMouseLeave, onMouseLeave),
      onMouseOver: handlerAll(props.onMouseOver, onMouseOver),
    })

    useUpdateEffect(() => {
      if (!isOpen) return

      const id = requestAnimationFrameId.current

      if (isFocused && !trulyDisabled && itemRef.current) {
        if (id) cancelAnimationFrame(id)

        requestAnimationFrameId.current = requestAnimationFrame(() => {
          itemRef.current?.focus({ preventScroll: true })

          requestAnimationFrameId.current = null
        })
      } else if (menuRef.current && !isActiveElement(menuRef.current)) {
        menuRef.current.focus({ preventScroll: true })
      }

      return () => {
        if (id) cancelAnimationFrame(id)
      }
    }, [isFocused, trulyDisabled, menuRef, isOpen])

    children =
      icon || command ? (
        <ui.span style={{ flex: 1 }}>{children}</ui.span>
      ) : (
        children
      )

    const css: CSSUIObject = {
      alignItems: "center",
      color: "inherit",
      display: "flex",
      flex: "0 0 auto",
      gap: "0.75rem",
      outline: 0,
      textAlign: "start",
      textDecoration: "none",
      userSelect: "none",
      width: "100%",
      ...styles.item,
    }

    return (
      <UpstreamMenuItemProvider
        value={{
          hasDownstreamRef,
          setDownstreamOpen,
          onKeyDownRef,
          onUpstreamRestoreFocus: onRestoreFocus,
        }}
      >
        <ui.div
          id={id}
          className={cx("ui-menu__item", className)}
          data-focus={dataAttr(isDownstreamOpen)}
          __css={css}
          {...rest}
          role={role}
          tabIndex={!isDownstreamOpen && isFocused ? 0 : -1}
        >
          {icon ? <MenuIcon>{icon}</MenuIcon> : null}
          {children}
          {command ? <MenuCommand>{command}</MenuCommand> : null}
        </ui.div>
      </UpstreamMenuItemProvider>
    )
  },
)

MenuItem.displayName = "MenuItem"
MenuItem.__ui__ = "MenuItem"

interface MenuOptionItemOptions {
  /**
   * The type of the menu option item.
   */
  type?: "checkbox" | "radio"
  /**
   * The menu option item icon to use.
   */
  icon?: null | ReactElement
  /**
   * If `true`, the checkbox or radio will be checked.
   *
   * @default false
   */
  isChecked?: boolean
  /**
   * The value of the menu option item.
   */
  value?: string
}

export interface MenuOptionItemProps
  extends Omit<MenuItemProps, "command" | "icon" | "value">,
    MenuOptionItemOptions {}

export const MenuOptionItem = forwardRef<MenuOptionItemProps, "button">(
  (
    { className, children, closeOnSelect = false, icon, isChecked, ...rest },
    ref,
  ) => {
    return (
      <MenuItem
        ref={ref}
        className={cx("ui-menu__item--option", className)}
        aria-checked={isChecked}
        closeOnSelect={closeOnSelect}
        {...rest}
      >
        {icon !== null ? (
          <MenuIcon opacity={isChecked ? 1 : 0}>
            {icon || <CheckIcon />}
          </MenuIcon>
        ) : null}
        {children}
      </MenuItem>
    )
  },
)

MenuOptionItem.displayName = "MenuOptionItem"
MenuOptionItem.__ui__ = "MenuOptionItem"

export interface MenuIconProps extends HTMLUIProps<"span"> {}

export const MenuIcon = forwardRef<MenuIconProps, "span">(
  ({ className, ...rest }, ref) => {
    const { styles } = useMenu()

    const css: CSSUIObject = {
      alignItems: "center",
      display: "inline-flex",
      flexShrink: 0,
      fontSize: "0.85em",
      justifyContent: "center",
      ...styles.icon,
    }

    return (
      <ui.span
        ref={ref}
        className={cx("ui-menu__item__icon", className)}
        aria-hidden
        __css={css}
        {...rest}
      />
    )
  },
)

MenuIcon.displayName = "MenuIcon"
MenuIcon.__ui__ = "MenuIcon"

export interface MenuCommandProps extends HTMLUIProps<"span"> {}

export const MenuCommand = forwardRef<MenuCommandProps, "span">(
  ({ className, ...rest }, ref) => {
    const { styles } = useMenu()

    const css: CSSUIObject = { ...styles.command }

    return (
      <ui.span
        ref={ref}
        className={cx("ui-menu__item__command", className)}
        __css={css}
        {...rest}
      />
    )
  },
)

MenuCommand.displayName = "MenuCommand"
MenuCommand.__ui__ = "MenuCommand"

const CheckIcon: FC = () => (
  <svg height="1em" viewBox="0 0 14 14" width="1em">
    <polygon
      fill="currentColor"
      points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"
    />
  </svg>
)
