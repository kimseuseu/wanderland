/**
 * Once Human POI Data Extractor
 *
 * Downloads and decodes POI (Point of Interest) coordinate data from the
 * Once Human interactive map at https://oncehuman.th.gl/
 *
 * Data source: CDN at https://cdn.th.gl/once-human/
 * Format: CBOR-encoded binary (.raw files)
 *
 * The version.json file at https://cdn.th.gl/once-human/version.json
 * contains the index of all node data files and filter/category definitions.
 *
 * Usage: node scripts/extract_oncehuman_pois.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { decode } = require('cbor-x');

const CDN_BASE = 'https://cdn.th.gl/once-human';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'oncehuman');

// Map internal names to human-readable scenario names
const MAP_NAMES = {
    'default': 'Manibus & Evolution\'s Call',
    'east_blackfell_pvp': 'Prismverse\'s Clash',
    'north_snow_pve': 'The Way of Winter',
    'raid': 'Raids & Dungeons',
    'eternaland': 'Eternaland',
    'once_human_raid_zone': 'Once Human: RaidZone',
    'endless_dream': 'Endless Dream',
    'deviation_secure': 'Deviation Secure'
};

function fetch(url) {
    return new Promise(function(resolve, reject) {
        https.get(url, function(res) {
            if (res.statusCode !== 200) {
                reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
                return;
            }
            const chunks = [];
            res.on('data', function(chunk) { chunks.push(chunk); });
            res.on('end', function() { resolve(Buffer.concat(chunks)); });
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('=== Once Human POI Data Extractor ===\n');

    // Step 1: Fetch version.json to get node file paths
    console.log('Fetching version.json...');
    const versionBuf = await fetch(CDN_BASE + '/version.json');
    const version = JSON.parse(versionBuf.toString('utf8'));

    const nodePaths = version.more.nodes;
    console.log('Found ' + Object.keys(nodePaths).length + ' map data files:\n');

    Object.entries(nodePaths).forEach(function(entry) {
        var scenarioName = MAP_NAMES[entry[0]] || entry[0];
        console.log('  ' + entry[0] + ' -> ' + scenarioName);
        console.log('    URL: ' + CDN_BASE + entry[1]);
    });

    // Step 2: Create output directory
    if (fs.existsSync(OUTPUT_DIR)) {
        // Clean existing
    } else {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Step 3: Save version/filter data
    console.log('\nSaving filter definitions...');
    const filterData = {
        id: version.id,
        createdAt: version.createdAt,
        createdAtISO: new Date(version.createdAt).toISOString(),
        filters: version.data.filters,
        tiles: version.data.tiles,
        regions: version.data.regions || null
    };
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'filters.json'),
        JSON.stringify(filterData, null, 2)
    );
    console.log('  Saved filters.json');

    // Step 4: Download and decode each map's node data
    console.log('\nDownloading and decoding node data...\n');

    const allMaps = {};
    let grandTotal = 0;

    for (const [mapKey, nodePath] of Object.entries(nodePaths)) {
        const scenarioName = MAP_NAMES[mapKey] || mapKey;
        const url = CDN_BASE + nodePath;

        console.log('Processing: ' + scenarioName + ' (' + mapKey + ')');

        try {
            const rawBuf = await fetch(url);
            console.log('  Downloaded: ' + (rawBuf.length / 1024).toFixed(1) + ' KB');

            const decoded = decode(rawBuf);

            // Count totals
            let mapTotal = 0;
            const categories = [];

            decoded.forEach(function(item) {
                const spawnCount = item.spawns ? item.spawns.length : 0;
                mapTotal += spawnCount;
                categories.push({
                    type: item.type,
                    mapName: item.mapName,
                    spawnCount: spawnCount,
                    spawns: item.spawns || []
                });
            });

            grandTotal += mapTotal;

            console.log('  Categories: ' + decoded.length);
            console.log('  Total spawns: ' + mapTotal);

            // Save per-map JSON
            const mapData = {
                mapKey: mapKey,
                scenarioName: scenarioName,
                categoryCount: decoded.length,
                totalSpawns: mapTotal,
                categories: categories
            };

            fs.writeFileSync(
                path.join(OUTPUT_DIR, mapKey + '.json'),
                JSON.stringify(mapData, null, 2)
            );
            console.log('  Saved: ' + mapKey + '.json\n');

            allMaps[mapKey] = {
                scenarioName: scenarioName,
                categoryCount: decoded.length,
                totalSpawns: mapTotal,
                types: categories.map(function(c) {
                    return { type: c.type, count: c.spawnCount };
                })
            };

        } catch (err) {
            console.log('  ERROR: ' + err.message + '\n');
        }
    }

    // Step 5: Save summary/index
    const summary = {
        source: 'https://oncehuman.th.gl/',
        cdnBase: CDN_BASE,
        extractedAt: new Date().toISOString(),
        versionId: version.id,
        versionCreatedAt: new Date(version.createdAt).toISOString(),
        grandTotalSpawns: grandTotal,
        maps: allMaps
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'index.json'),
        JSON.stringify(summary, null, 2)
    );

    console.log('=== Summary ===');
    console.log('Total maps: ' + Object.keys(allMaps).length);
    console.log('Grand total spawn points: ' + grandTotal);
    console.log('Output directory: ' + OUTPUT_DIR);
    console.log('\nFiles created:');
    console.log('  index.json      - Summary and map index');
    console.log('  filters.json    - Filter/category definitions with icon sprite coordinates');
    Object.keys(nodePaths).forEach(function(k) {
        console.log('  ' + k + '.json - POI data for ' + (MAP_NAMES[k] || k));
    });

    console.log('\n=== Data Format ===');
    console.log('Each map JSON contains categories with spawns:');
    console.log('  { type: "copper_ore", mapName: "default", spawns: [');
    console.log('    { p: [x, y, z] },   // Simple spawn with 3D coordinates');
    console.log('    { p: [x, y, z], id: "...", data: {...} }  // Named POI with metadata');
    console.log('  ]}');
    console.log('\nCoordinates are in game units (not lat/lng).');
    console.log('The map uses a custom CRS transformation defined in version.json tiles config.');
}

main().catch(function(err) {
    console.error('Fatal error:', err);
    process.exit(1);
});
