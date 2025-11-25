import { MessageSquareText } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Form from "@radix-ui/react-form";
import { Title } from "@radix-ui/react-toast";
import { useTranslation } from "react-i18next";

export function SuggestEdit() {
  const { t } = useTranslation();

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="fixed bottom-6 left-6 p-3 bg-black-1 hover:bg-black-1 sm:hover:bg-black-2 text-white rounded-full shadow-lg transition-colors duration-200 z-[35]"
            aria-label="Suggest an edit"
          >
            <MessageSquareText />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="ml-6 rounded-xl bg-black-1 p-4 shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)]
              will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)]
              data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade
              data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade z-[35]"
            sideOffset={5}
          >

            {/* Suggestion form start */}
            <Form.Root className="w-[260px]" onSubmit={(e) => {
              // on submit question
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const questionValue = formData.get("question");
                const emailSubject = `${t("landingPage.emailTitle")} klimatkollen.se`;
                const encodedSubject = encodeURIComponent(emailSubject);
                const encodedBody = encodeURIComponent(questionValue);
                window.location.href = `mailto:hej@klimatkollen.se?subject=${emailSubject}&body=${questionValue}`;
            }}>
              <Title className="text-[22px] mb-2">{t("landingPage.reportCorrection")}</Title>
              <Form.Field className="mb-2.5 grid" name="question">
                <div className="flex items-baseline justify-between">
                  <Form.Message
                    className="text-[13px] text-white opacity-80"
                    match="valueMissing"
                  >
                    {t("landingPage.questionMissing")}
                  </Form.Message>
                </div>
                <Form.Control asChild>
                  <textarea
                    className="box-border block w-full min-h-[200px] p-3 appearance-none items-center justify-center rounded-lg bg-blackA2 text-[16px] leading-none text-black-2 shadow-[0_0_0_1px] shadow-blackA6 outline-none selection:bg-blackA6 selection:text-black-2 hover:shadow-[black-2] focus:shadow-[0_0_0_2px_black-2]"
                    placeholder={t("landingPage.questionPlaceholder")}
                    required
                  />
                </Form.Control>
              </Form.Field>
              <Form.Submit asChild>
                <button className="w-full inline-flex items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium">
                  {t("landingPage.submitQuestion")}
                </button>
              </Form.Submit>
            </Form.Root>
            {/* Suggestion form end */}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
