import { stripNumberFormatting } from "@/utils/ui/numberFormat";

export function collectFormDataFromElement(
  formElement: HTMLFormElement,
  formData: Map<string, string>,
): Map<string, string> {
  const nextFormData = new Map(formData);

  for (const input of formElement.querySelectorAll("input")) {
    if (input.type === "checkbox") {
      if (input.checked !== input.defaultChecked) {
        nextFormData.set(input.name, input.checked ? "true" : "false");
      }
      continue;
    }

    if (input.value !== input.defaultValue) {
      const value = input.hasAttribute("data-formatted-number")
        ? stripNumberFormatting(input.value)
        : input.value;
      nextFormData.set(input.name, value);
    }
  }

  for (const textarea of formElement.querySelectorAll("textarea")) {
    if (textarea.value !== textarea.defaultValue) {
      nextFormData.set(textarea.name, textarea.value);
    }
  }

  return nextFormData;
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 401
  );
}
