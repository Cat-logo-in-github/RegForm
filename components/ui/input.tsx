import * as React from "react"

import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    console.log("Input type:", type)

    const defaultComponent = (<input
                              type={type}
                              className={cn(
                                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                className
                              )}
                              ref={ref}
                              {...props}
                            />)
    
    const fileUploadComponent = (<div>
                                  <input
                                    type={type}
                                    className="hidden"
                                    ref={(node) => {
                                      inputRef.current = node
                                      if (typeof ref === "function") ref(node)
                                      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
                                    }}
                                    {...props}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      inputRef.current?.click()
                                    }}
                                    className={cn(
                                      "flex flex-row items-center justify-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                      className
                                    )}
                                  >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload File</span>
                                  </button>
                                </div>)

    return type === "file" ? fileUploadComponent : defaultComponent;
  }
)
Input.displayName = "Input"

export { Input }
