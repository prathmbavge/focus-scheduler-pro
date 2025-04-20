import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from 'react';

// Button variants
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
        // Variant styles
        {
          'primary': 'bg-blue-600 text-white hover:bg-blue-700',
          'secondary': 'bg-gray-600 text-white hover:bg-gray-700',
          'outline': 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          'ghost': 'text-gray-600 hover:bg-gray-100'
        }[variant],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';

// Text field component
export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2 rounded-lg',
          'border border-gray-300',
          'bg-white text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);
TextField.displayName = 'TextField';

// Text area component
export const TextArea = forwardRef<HTMLTextAreaElement, InputHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-2 rounded-lg',
          'border border-gray-300',
          'bg-white text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'placeholder:text-gray-400',
          'min-h-[100px] resize-y',
          className
        )}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';
