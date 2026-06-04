import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { RelatedTerritoriesList } from "@/components/detail/RelatedTerritoriesList";
import { RelatedTerritoriesMapPanel } from "@/components/detail/RelatedTerritoriesMapPanel";
import { useRelatedTerritoriesMap } from "@/hooks/territories/useRelatedTerritoriesMap";
import { useTerritoryHoverSync } from "@/hooks/territories/useTerritoryHoverSync";
import { useTerritoryListLayout } from "@/hooks/territories/useTerritoryListLayout";
import { useScreenSize } from "@/hooks/useScreenSize";
import { MapEntityType } from "@/types/rankings";

interface EntityListBoxProps {
  items: string[];
  entityType: MapEntityType;
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function EntityListBox(props: EntityListBoxProps) {
  if (props.items.length === 0) {
    return null;
  }

  return <EntityListBoxContent {...props} />;
}

function EntityListBoxContent({
  items,
  entityType,
  helpItems = [],
  translateNamespace = "detailPage",
}: EntityListBoxProps) {
  const { t } = useTranslation();
  const {
    selectedKPI,
    mapData,
    territories,
    geoData,
    onAreaClick,
    defaultCenter,
    loading,
  } = useRelatedTerritoriesMap({ items, entityType });
  const { isMobile } = useScreenSize();
  const { hoveredMapName, setHoveredMapName, isHovered } =
    useTerritoryHoverSync();

  const {
    layoutRef,
    panelRef,
    currentPage,
    setCurrentPage,
    totalPages,
    visibleRange,
    showPagination,
  } = useTerritoryListLayout(territories, !isMobile, hoveredMapName);

  const translationKey = `${translateNamespace}.${entityType}`;
  const visibleTerritories = showPagination
    ? territories.slice(visibleRange.startIndex, visibleRange.endIndex)
    : territories;

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(translationKey)}
      </Text>
      {selectedKPI?.detailedDescription && (
        <div className="mb-4 md:mb-6">
          <p className="text-sm font-medium text-white">{selectedKPI.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-grey">
            {selectedKPI.detailedDescription}
          </p>
        </div>
      )}
      {!loading && !selectedKPI && (
        <p className="text-sm text-grey">{t("noData")}</p>
      )}
      {(loading || selectedKPI) && (
        <div
          ref={layoutRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          <RelatedTerritoriesMapPanel
            entityType={entityType}
            geoData={geoData}
            mapData={mapData}
            selectedKPI={selectedKPI}
            onAreaClick={onAreaClick}
            defaultCenter={defaultCenter}
            loading={loading}
            hoveredMapName={hoveredMapName}
            onHoveredMapNameChange={setHoveredMapName}
          />
          {selectedKPI && (
            <RelatedTerritoriesList
              visibleTerritories={visibleTerritories}
              entityType={entityType}
              isHovered={isHovered}
              onHover={setHoveredMapName}
              panelRef={showPagination ? panelRef : undefined}
              showPagination={showPagination}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}
