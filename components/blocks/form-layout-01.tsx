import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface FormLayout01Props {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
}

export function FormLayout01({
  title,
  description,
  children,
  onSubmit,
  submitText = "บันทึกข้อมูล",
  cancelText = "ยกเลิก",
  onCancel,
}: FormLayout01Props) {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl">
        <h3 className="text-balance text-lg font-bold text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-pretty mt-1 text-xs text-gray-500">
          {description}
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }} 
          className="mt-6"
        >
          <div className="space-y-5">
            {children}
          </div>
          
          {(onSubmit || onCancel) && (
            <>
              <Separator className="my-5" />
              <div className="flex items-center justify-end space-x-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="whitespace-nowrap text-xs font-semibold text-gray-500 h-9"
                  >
                    {cancelText}
                  </Button>
                )}
                {onSubmit && (
                  <Button type="submit" className="whitespace-nowrap text-xs font-bold h-9 text-white bg-gray-900 hover:bg-gray-800">
                    {submitText}
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
