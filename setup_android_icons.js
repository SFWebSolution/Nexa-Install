const fs = require('fs');
const path = require('path');

const srcIcon = path.join(__dirname, 'icon-512.png');
const resDir = path.join(__dirname, 'nexa-android', 'app', 'src', 'main', 'res');

const densities = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
    'drawable'
];

if (!fs.existsSync(srcIcon)) {
    console.error('Source icon not found:', srcIcon);
    process.exit(1);
}

const iconBuffer = fs.readFileSync(srcIcon);

densities.forEach(d => {
    const dir = path.join(resDir, d);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), iconBuffer);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), iconBuffer);
    fs.writeFileSync(path.join(dir, 'icon.png'), iconBuffer);
});

console.log('Successfully created all Android mipmap and drawable icon resources!');
