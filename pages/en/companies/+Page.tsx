export { Page }

import { CompaniesPage } from "../../../src/pages/CompaniesPage"
import { Layout } from "../../../src/components/layout/Layout"
import { ToastProvider } from "../../../src/contexts/ToastContext"
import { DataGuideProvider } from "../../../src/data-guide/DataGuide"

function Page() {
  return (
    <ToastProvider>
      <DataGuideProvider>
        <Layout>
          <CompaniesPage />
        </Layout>
      </DataGuideProvider>
    </ToastProvider>
  )
}
