Promise.all([
    d3.json('SF.geojson'), // Adjust the path to your GeoJSON file
    d3.csv('data.csv') // Adjust the path to your CSV file
]).then(function([geoJson, crimeData]) {

    // Convert crime counts to numbers and create a map of district to crime data
    const crimeByDistrict = new Map();
    crimeData.forEach(d => {
        crimeByDistrict.set(d.District, +d.Total_Crimes);
    });

    // Set up the SVG canvas
    const svg = d3.select('#map').append('svg')
        .attr('width', 800)
        .attr('height', 600);

    // Set up a logarithmic color scale from the lowest to the highest crime count
    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain(d3.extent(crimeData, d => Math.log(+d.Total_Crimes + 1) * 10)) // Adjust base and multiply to stretch the scale
        .interpolator(d3.scaleLog().base(5).clamp(true)); // Using a smaller base to make the scale steeper

    // Create a projection that fits the GeoJSON to the SVG area
    const projection = d3.geoMercator()
        .fitSize([800, 600], geoJson);

    const path = d3.geoPath()
        .projection(projection);

    // Draw each district with a color based on its crime count
    svg.selectAll('path')
        .data(geoJson.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', d => {
            const crime = crimeByDistrict.get(d.properties.NAME); // Adjust this if your GeoJSON uses a different property name
            return crime ? colorScale(Math.log(crime + 1) * 10) : '#ccc'; // Applying logarithm with multiplier
        })
        .attr('stroke', '#fff'); // White stroke for district boundaries

    // Optional: Add a legend here if needed
});
