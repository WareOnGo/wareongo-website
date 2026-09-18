import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { thumbLabels?: string[]; thumbValueTexts?: string[] }
>(({ className, thumbLabels, thumbValueTexts, ...props }, ref) => {
  const values = Array.isArray(props.value) ? props.value : [props.value || props.defaultValue?.[0] || 0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-wareongo-blue/15">
        <SliderPrimitive.Range className="absolute h-full bg-wareongo-blue" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb 
          key={index}
          aria-label={thumbLabels?.[index]}
          aria-valuetext={thumbValueTexts?.[index]}
          className="block h-5 w-5 rounded-full border-2 border-wareongo-blue bg-wareongo-ivory transition-colors before:absolute before:-inset-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
