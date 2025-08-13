export { Page }

import { LandingPage } from "../../src/pages/LandingPage"
import { Layout } from "../../src/components/layout/Layout"
import { ToastProvider } from "../../src/contexts/ToastContext"
import { DataGuideProvider } from "../../src/data-guide/DataGuide"

function Page() {
  return (
    <ToastProvider>
      <DataGuideProvider>
        <Layout>
          <LandingPage />
        </Layout>
      </DataGuideProvider>
    </ToastProvider>
  )
}
