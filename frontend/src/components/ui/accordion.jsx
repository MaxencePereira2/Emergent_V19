import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    // overflow-visible + marge => l’item “pousse” bien le suivant pendant l’animation
    className={cn("border-b overflow-visible mb-3", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // text-left pour éviter la centration sur mobile
        "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline " +
          // rotation de l’icône à l’ouverture
          "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    // On anime la hauteur réelle calculée par Radix.
    // will-change améliore la fluidité, overflow-hidden empêche le “saignement” en fermeture.
    className={cn(
      "overflow-hidden text-sm will-change-[height] " +
        "data-[state=closed]:animate-accordion-up " +
        "data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    {/* Padding à l’intérieur uniquement (ne gêne pas la fermeture car la hauteur animée passe à 0) */}
    <div className="pt-2 pb-4">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
