export function mapCompanyEditFormToRequestBody(
  selectedPeriods,
  formData: Map<string, string>,
) {
  const formKeys = Array.from(formData.keys());
  const periodsUpdate = [];
  for (const period of selectedPeriods) {
    const periodUpdate: any = {
      id: period.id,
    };
    if (formData.has("start-date-" + period.id)) {
      periodUpdate.startDate =
        formData.get("start-date-" + period.id) ?? period.startDate;
    } else {
      periodUpdate.startDate = period.startDate;
    }
    if (formData.has("end-date-" + period.id)) {
      periodUpdate.endDate =
        formData.get("end-date-" + period.id) ?? period.endDate;
    } else {
      periodUpdate.endDate = period.endDate;
    }
    periodUpdate.emissions = {};
    if (formData.has("scope-1-" + period.id)) {
      periodUpdate.emissions.scope1 = {
        total: parseInt(formData.get("scope-1-" + period.id) || "0") ?? 0,
        verified: formData.get("scope-1-" + period.id + "-checkbox") === "true",
      };
    }
    if(formData.has("scope-2-mb-" + period.id) || formData.has("scope-2-lb-" + period.id) || formData.has("scope-2-unknown-" + period.id)) {
      periodUpdate.emissions.scope2 = {};
    }

    if (formData.has("scope-2-mb-" + period.id)) {
      periodUpdate.emissions.scope2.mb =
        parseInt(formData.get("scope-2-mb-" + period.id) || "0") ?? 0;
    }
    if (formData.has("scope-2-lb-" + period.id)) {
      periodUpdate.emissions.scope2.lb =
        parseInt(formData.get("scope-2-lb-" + period.id) || "0") ?? 0;
    }
    if (formData.has("scope-2-unknown-" + period.id)) {
      periodUpdate.emissions.scope2.unknown =
        parseInt(formData.get("scope-2-unknown-" + period.id) || "0") ?? 0;
    }

    if (
      formData.has("scope-2-unknown-" + period.id + "-checkbox") ||
      formData.has("scope-2-lb-" + period.id + "-checkbox") ||
      formData.has("scope-2-mb-" + period.id + "-checkbox")
    ) {
      periodUpdate.emissions.scope2.verified =
        formData.get("scope-2-unknown-" + period.id + "-checkbox") === "true" ||
        formData.get("scope-2-lb-" + period.id + "-checkbox") === "true" ||
        formData.get("scope-2-mb-" + period.id + "-checkbox") === "true";
    }
    for (const formKey of formKeys) {
      if (
        formKey.startsWith("scope-3-" + period.id) &&
        !formKey.endsWith("-checkbox")
      ) {
        const categoryId = formKey.substring(formKey.lastIndexOf("-") + 1);
        if (periodUpdate.emissions.scope3 === undefined) {
          periodUpdate.emissions.scope3 = {};
          periodUpdate.emissions.scope3.categories = [];
        }
        periodUpdate.emissions.scope3.categories.push({
          category: parseInt(categoryId),
          total: parseInt(formData.get(formKey) || "0") ?? 0,
          verified: formData.get(formKey + "-checkbox") === "true",
        });
      }
    }
    periodsUpdate.push(periodUpdate);
}
    const metadata: {
        comment?: string,
        source?: string
    } = {};

    if(formData.get('comment')) {
        metadata.comment = formData.get('comment');
    }

    if(formData.get('source')) {
        metadata.source = formData.get('source');
    }
    return {
        reportingPeriods: periodsUpdate,
        metadata
    };
}
