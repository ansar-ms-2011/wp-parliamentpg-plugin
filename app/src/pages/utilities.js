const fetchFilters = (settings, status_type, setFilterFields, setLoading)=>{
    fetch(`${settings.root}parliament-pg/v1/get-filters-data?type=${status_type}`, {
        headers: {
            'X-WP-Nonce': settings.nonce
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setFilterFields(prev =>
                prev.map(field =>
                    field.id === "statusId"
                        ? {
                            ...field,
                            options: data.statuses,
                        }
                        : field
                )
            );
            setFilterFields(prev =>
                prev.map(field =>
                    field.id === "categoryId"
                        ? {
                            ...field,
                            options: data.categories,
                        }
                        : field
                )
            );
            setFilterFields(prev =>
                prev.map(field =>
                    field.id === "year"
                        ? {
                            ...field,
                            options: data.years,
                        }
                        : field
                )
            );
            setFilterFields(prev =>
                prev.map(field =>
                    field.id === "sortBy"
                        ? {
                            ...field,
                            options: data.sortOptions,
                        }
                        : field
                )
            );
            setLoading(false);
        })
        .catch(err => {
            console.error("Fetch error:", err)
        });
}

export default fetchFilters;