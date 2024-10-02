import type { IconProps } from "@yamada-ui/react"
import { Icon } from "@yamada-ui/react"
import { forwardRef } from "react"

export const Apple = forwardRef<SVGSVGElement, IconProps>(
  ({ boxSize = "1.5em", ...rest }, ref) => {
    return (
      <Icon
        ref={ref}
        boxSize={boxSize}
        fill="currentcolor"
        focusable="false"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <path d="M54.166,19.783c-0.258,0.162 -6.401,3.571 -6.401,11.13c0.29,8.621 7.752,11.644 7.88,11.644c-0.128,0.162 -1.127,4.119 -4.085,8.267c-2.347,3.574 -4.953,7.176 -8.91,7.176c-3.764,0 -5.115,-2.381 -9.458,-2.381c-4.664,0 -5.984,2.381 -9.555,2.381c-3.957,0 -6.756,-3.795 -9.232,-7.335c-3.216,-4.633 -5.95,-11.903 -6.047,-18.883c-0.065,-3.699 0.644,-7.335 2.444,-10.423c2.541,-4.312 7.077,-7.238 12.031,-7.335c3.795,-0.128 7.173,2.606 9.49,2.606c2.22,0 6.37,-2.606 11.065,-2.606c2.027,0.002 7.432,0.612 10.778,5.759zM32.002,13.285c-0.676,-3.378 1.19,-6.756 2.927,-8.911c2.22,-2.605 5.726,-4.374 8.749,-4.374c0.193,3.378 -1.03,6.691 -3.216,9.104c-1.962,2.606 -5.34,4.567 -8.46,4.181z"></path>
      </Icon>
    )
  },
)

Apple.displayName = "Apple"
