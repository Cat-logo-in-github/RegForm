"use client"
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "@/app/styles/toast.module.css"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z, ZodObject, ZodRawShape, ZodString, ZodArray, ZodDate, ZodEnum, ZodEffects, ZodOptional } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formMeta } from "@/app/utils/forms/schema";
import { post } from "@/app/utils/PostGetData";

interface FormSelectProps {
  name: string;
  options: { value: string; label: string }[];
  label: string;
  placeholder: string;
}
const getAuthToken = (): string | null => {
  const cookies = document.cookie.split("; ");
  const authToken = cookies.find(cookie => cookie.startsWith("authToken="));
  return authToken ? authToken.split("=")[1] : null;
};
const RenderForm: React.FC<{ schema: ZodObject<ZodRawShape>, draftSchema: ZodObject<ZodRawShape>, meta: formMeta, defaultvalues: Record<string, any>, formId: string }> = ({ schema, draftSchema, meta, defaultvalues, formId }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  const [arrayFieldCounts, setArrayFieldCounts] = useState<Record<string, number>>({});
  const [isSaveDraft, setIsSaveDraft] = useState(false);
  const formSchema = isSaveDraft ? draftSchema : schema;
  const [hasReset, setHasReset] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {},
    
  });
  useEffect(() => {
    if (defaultvalues) {
      form.reset(defaultvalues);
      // Signal that reset is complete
      setHasReset((prev: boolean) => !prev);
    }
  }, [form, defaultvalues]);
   const addFieldToArray = useCallback(
    (fieldPath: string, min: number) => {
      setArrayFieldCounts((prev) => ({
        ...prev,
        [fieldPath]: prev[fieldPath] != null ? prev[fieldPath] + 1 : min + 1,
      }));
    },
    [setArrayFieldCounts]
  );
  const removeFieldToArray = useCallback(
    (fieldPath: string, min: number) => {
      setArrayFieldCounts((prev) => {
        const currentCount = prev[fieldPath] || 0;
  
        // If the array is null or has length 0, set the count to min - 1
        if (currentCount === 0) {
          return {
            ...prev,
            [fieldPath]: min - 1, // Allows going below min but not below 0
          };
        }
  
        // Only decrement if the count is greater than min
        if (currentCount > min) {
          return {
            ...prev,
            [fieldPath]: currentCount - 1,
          };
        }
  
        // If already at the min, allow it to go below min but ensure it doesn't go below 0
        return {
          ...prev,
          [fieldPath]: currentCount - 1 >= 0 ? currentCount - 1 : 0,
        };
      });
  
      // Handle form values after updating the count
      const currentCount = arrayFieldCounts[fieldPath] || 0;
      const indexToRemove = currentCount - 1;
  
      // Get the current form values
      const currentValues = form.getValues();
  
      // Parse the field path to handle nested arrays correctly
      const pathSegments = fieldPath.split('.');
      const arrayFieldName = pathSegments[pathSegments.length - 1];
  
      // Get the parent object containing the array
      let parentObject = currentValues;
      for (let i = 0; i < pathSegments.length - 1; i++) {
        parentObject = parentObject[pathSegments[i]];
      }
  
      // If the array exists in the parent object
      if (Array.isArray(parentObject[arrayFieldName])) {
        // Remove the last element from the array
        parentObject[arrayFieldName].splice(indexToRemove, 1);
  
        // Unregister all fields for the removed index
        Object.keys(form.getValues())
          .filter(key => key.startsWith(`${fieldPath}[${indexToRemove}]`))
          .forEach(key => {
            form.unregister(key);
          });
  
        // Update form values
        form.reset(currentValues);
      }
    },
    [arrayFieldCounts, form]
  );
  
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (isSaveDraft) {
        setIsSubmittingDraft(true);

        const response = await post<{ success: boolean; error?: { message: string } }>(
          `/api/form/saveForm`,
          {
            fields: data,
            isDraft: true,
            formId: formId,
            cookies: getAuthToken,
          }
        );
        // console.log(response);
        // Handle response for draft saving
        if (response.data?.success) {
          toast({
            title: "Draft Saved",
            description: "Your form draft has been saved successfully.",
            className: styles["mobile-toast"],
          });
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `${response.error?.message || "Failed to save your draft. Please try again."}`,
            className: styles["mobile-toast"],
          });
        }
      } else {
        setIsSubmitting(true);

        const response = await post<{ success: boolean; error?: { message: string } }>(
          `/api/form/saveForm`,
          {
            fields: data,
            isDraft: false,
            formId: formId,
            cookies: getAuthToken,
          }
        );

        // Handle response for form submission
        if (response.data?.success) {
          toast({
            title: "Submission Successful",
            description: "Your form data has been submitted successfully.",
            className: styles["mobile-toast"],
          });
          router.push('/dashboard/regForm');
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `${response.error?.message || "Failed to submit your form. Please try again."}`,
            className: styles["mobile-toast"],
          });
        }
      }
    } catch (error) {
      // console.error("Submission error:", error);

      // Display error toast for unexpected errors
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An error occurred while processing your request. Please try again later.",
        className: styles["mobile-toast"],
      });
    } finally {
      setIsSubmittingDraft(false);
      setIsSubmitting(false); // Reset loading state
    }
  }


  // Button click handler to toggle save draft
  const handleSaveDraftClick = () => {

    setIsSaveDraft(true);  // Set to Save Draft mode
    // form.handleSubmit(onSubmit)(); // Submit draft form
  };

  // Button click handler to toggle form submission
  const handleSubmitClick = () => {
    setIsSaveDraft(false); // Set to regular Submit mode
    // form.handleSubmit(onSubmit)(); // Submit form
  };

  const FormInput = React.memo(({ name, label, placeholder }: { name: string; label: string; placeholder: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-bold">{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              onChange={(e) => {
                // Normalize empty string to undefined
                const value = e.target.value || undefined;
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));


  const FormDate = React.memo(({ name, label, placeholder }: { name: string; label: string; placeholder: string }) => {
    const currentDate = new Date();
// Only allow eligible birthdates (>=17 and <25 on 1 Feb 2026)
const minDate = new Date(2001, 1, 2); // After 1 Feb 2001
const maxDate = new Date(2009, 1, 1); // On or before 1 Feb 2009


    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);
    const [calendarMonth, setCalendarMonth] = React.useState<Date | undefined>();

    const yearOptions = Array.from(
      { length: maxDate.getFullYear() - minDate.getFullYear() + 1 },
      (_, i) => minDate.getFullYear() + i
    );

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString("default", { month: "long" }),
    }));

    const handleYearChange = (year: number) => {
      const newDate = calendarMonth
        ? new Date(calendarMonth.setFullYear(year))
        : new Date(year, selectedMonth || 0, 1);
      setCalendarMonth(newDate);
      setSelectedYear(year);
    };

    const handleMonthChange = (month: number) => {
      const newDate = calendarMonth
        ? new Date(calendarMonth.setMonth(month))
        : new Date(selectedYear || currentDate.getFullYear(), month, 1);
      setCalendarMonth(newDate);
      setSelectedMonth(month);
    };

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          // Ensure the initial value is a Date object
          const value = field.value ? new Date(field.value) : undefined;
          
          return (
            <FormItem className="flex flex-col pt-2">
              <FormLabel className="font-bold">{label}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("pl-3 text-left font-normal", !value && "text-muted-foreground")}
                    >
                      {value ? format(value, "PPP") : <span>{placeholder}</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="flex gap-2 mb-4">
                    <Select
                      onValueChange={(value) => {
                        const year = parseInt(value);
                        handleYearChange(year);
                      }}
                      value={selectedYear ? String(selectedYear) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => {
                        const month = parseInt(value);
                        handleMonthChange(month);
                      }}
                      value={selectedMonth !== null ? String(selectedMonth) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month.value} value={String(month.value)}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                      const dateValue = date ? new Date(date) : undefined;
                      setSelectedDate(dateValue);
                      field.onChange(dateValue);
                    }}
                    disabled={(date) => date < minDate || date > maxDate}
                    month={calendarMonth}
                    onMonthChange={(newMonth) => {
                      setCalendarMonth(newMonth);
                      setSelectedYear(newMonth.getFullYear());
                      setSelectedMonth(newMonth.getMonth());
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  });


  const FormSelect = React.memo(({ name, options, label, placeholder }: FormSelectProps) => {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          const [selectedValue, setSelectedValue] = useState<string | undefined>(field.value || undefined); // Initialize with field.value
          
          return (
            <FormItem>
              <FormLabel className="font-bold">{label}</FormLabel>
              <Select
                {...field}
                onValueChange={(value) => {
                  // If the selected value matches the placeholder, set to undefined
                  field.onChange(value === placeholder ? undefined : value);
                  setSelectedValue(value);
                }}
                value={selectedValue}  // Ensure value is controlled
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />  {/* Placeholder is now correctly handled */}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  });
  
  







  const getNestedMetaValue = (meta: any, path: string, key: string) => {
    const keys = path.split('.');
    let current = meta;

    for (const k of keys) {
      if (current[k] !== undefined) {
        current = current[k];
      } else {
        return "";
      }
    }
    return current[key];
  };



  const renderFormFields = (schema: ZodObject<ZodRawShape>, path = "", metapath = "") => {
    return Object.entries(schema.shape).map(([key, value]) => {
      const fieldPath = path ? `${path}.${key}` : key;
      const metafieldpath = metapath ? `${metapath}.${key}` : key;

      let baseSchema = value;

      if (value instanceof ZodOptional) {
        baseSchema = value._def.innerType;
      }

      if (baseSchema instanceof ZodEffects) {
        baseSchema = baseSchema._def.schema;
      }

      if (baseSchema instanceof ZodString) {
        return (
          <FormInput
            key={fieldPath}
            name={fieldPath}
            label={getNestedMetaValue(meta, metafieldpath, "label") as string}
            placeholder={getNestedMetaValue(meta, metafieldpath, "placeholder") as string}
          />
        );
      } else if (baseSchema instanceof ZodDate) {
        return (
          <FormDate
            key={fieldPath}
            name={fieldPath}
            label={getNestedMetaValue(meta, metafieldpath, "label") as string}
            placeholder={getNestedMetaValue(meta, metafieldpath, "placeholder") as string}
          />
        );
      } else if (baseSchema instanceof ZodEnum) {
        const options = (baseSchema as ZodEnum<[string, ...string[]]>)._def.values.map((option) => ({
          value: option,
          label: option,
        }));
        return (
          <FormSelect
            key={fieldPath}
            name={fieldPath}
            options={options}
            label={getNestedMetaValue(meta, metafieldpath, "label") as string}
            placeholder={getNestedMetaValue(meta, metafieldpath, "placeholder") as string}
          />
        );
      } else if (baseSchema instanceof ZodObject) {

        return (
          <div key={fieldPath} className="nested-form">
            <h3 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">{getNestedMetaValue(meta, fieldPath + ".title", "label")}</h3>
            {renderFormFields(baseSchema, fieldPath, metafieldpath)}
          </div>
        );
      } else if (baseSchema instanceof ZodArray) {
        const defaultArray = defaultvalues?.[fieldPath];
        const defaultLength = Array.isArray(defaultArray) ? defaultArray.length : 0;


        const min = baseSchema._def.minLength?.value ?? 0;
        const arrayCount = arrayFieldCounts[fieldPath] || Math.max(defaultLength, min);
        const max = baseSchema._def.maxLength?.value ?? 1;

        const arrayFields = Array.from({ length: arrayCount }, (_, index) => {
          const fieldName = `${fieldPath}[${index}]`;
          return (
            <div key={fieldPath + fieldName} className="pt-5">
              <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                Player {index + 1}
              </h1>
              {renderFormFields(baseSchema._def.type, fieldName, fieldPath)}
            </div>
          )
        });
        FormInput.displayName = "FormInput";
        FormDate.displayName = "FormDate";
        FormSelect.displayName = "FormSelect";
        // const memoizedFormFields = useMemo(() => renderFormFields(schema), [schema, arrayFieldCounts]);

        return (
          <div key={fieldPath} className="nested-form">
            <h3 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">{getNestedMetaValue(meta, fieldPath + ".title", "label")}</h3>
            {arrayFields}
            <div className="flex justify-center gap-4 mt-6">
              {arrayCount < max && (
                <Button
                  type="button"
                  onClick={() => addFieldToArray(fieldPath, Math.max(defaultLength, min))}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  Add Player
                </Button>
              )}
              {arrayCount > min && (
                <Button
                  type="button"
                  onClick={() => removeFieldToArray(fieldPath,Math.max(defaultLength,min))}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  Remove Player
                </Button>
              )}
            </div>
          </div>
        );
      }

      return null;
    });
  };















  FormSelect.displayName = "FormSelect";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFormFields = useMemo(() => renderFormFields(schema), [schema, arrayFieldCounts,hasReset]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} 
      className="sm:w-2/3 space-y-6 mx-auto bg-white rounded-xl  sm:p-8  sm:mt-8"
      >
        
      <div className="flex justify-between   gap-4 mt-6 ">
      <div className="ml-4">
                 <Link
                      href="/dashboard/regForm" 
                      className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      <span>Go Back</span>
                    </Link>     
                  </div>  
          <div className=" gap-3 flex">
          <Button
            onClick={handleSaveDraftClick}

            type="submit"
            disabled={isSubmittingDraft}
            className="bg-white text-black hover:bg-slate-100 border-2 border-solid border-black font-semibold py-2.5 px-6  duration-200"
          >
            {isSubmittingDraft ? (
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
            ) : (
              "Save Draft"
            )}
          </Button>
          
          <Button
            onClick={handleSubmitClick}
            type="button"
            disabled={isSubmitting}
            className=" font-semibold py-2.5 px-6  duration-200"
          >
            {isSubmitting ? (
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
            ) : (
              "Submit"
            )}
          </Button>
          </div>
        </div>
        {memoizedFormFields}
        <div className="flex justify-end gap-4 mt-6 pb-6">
          <Button
            onClick={handleSaveDraftClick}
            type="button"
            disabled={isSubmittingDraft}
            className="bg-white text-black hover:bg-slate-100 border-2 border-solid border-black font-semibold py-2.5 px-6  duration-200"
          >
            {isSubmittingDraft ? (
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
            ) : (
              "Save Draft"
            )}
          </Button>
          
          <Button
            onClick={handleSubmitClick}
            type="button"
            disabled={isSubmitting}
            className=" font-semibold py-2.5 px-6  duration-200"
          >
            {isSubmitting ? (
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RenderForm;
