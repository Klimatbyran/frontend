export { Page }

import { AboutPage } from "../../../src/pages/AboutPage"
import { Layout } from "../../../src/components/layout/Layout"
import { ToastProvider } from "../../../src/contexts/ToastContext"
import { DataGuideProvider } from "../../../src/data-guide/DataGuide"

function Page() {
  return (
    <ToastProvider>
      <DataGuideProvider>
        <Layout>
          <AboutPage />
        </Layout>
      </DataGuideProvider>
    </ToastProvider>
  )
}
