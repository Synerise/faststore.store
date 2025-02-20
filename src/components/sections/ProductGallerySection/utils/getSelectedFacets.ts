function getSelectedFacets(searchParams: URLSearchParams) {

    const textFacets = searchParams.get("sFacets");
    const rangeFacets = searchParams.get("rangeFacets");

    const textFacetsNames = textFacets ? textFacets.split(",") : []
    const rangeFacetsNames = rangeFacets ? rangeFacets.split(",") : []


    const facets: {
        text: Record<string, string[]>
        range: Record<string, { min: number, max: number }>
    } = {
        range: {},
        text: {}
    }

    textFacetsNames.forEach((facetName) => {
        facets.text[facetName] = searchParams.getAll(facetName)
    })

    rangeFacetsNames.forEach((facetName) => {
        const rangeFacetValue = searchParams.get(facetName);
        if (rangeFacetValue) {
            const [min, max] = rangeFacetValue.split(";");
            if (min && max) {
                facets.range[facetName] = {
                    min: Number(min),
                    max: Number(max),
                }
            }
        }

    })

    return facets;
}


export default getSelectedFacets
