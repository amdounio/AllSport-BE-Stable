const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios');
const { format, parse, addHours,isValid } = require('date-fns');
const { fr } = require('date-fns/locale');
const path = require('path');
const imagesDirectory = path.join(__dirname, '../public/images'); // Directory for saving images
const { Match } = require("../config/relation");
const flatted = require('flatted');

async function fetchImageBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

const generateImageController = async (req, res) => {
    try {
       // const { date, hour, address, team1LogoUrl, team2LogoUrl, iconUrl, backgroundUrl, watermarkUrl } = req.body;
        iconUrl = "https://allsports-front.2points.fr/payloads/logo.png"
      //  backgroundUrl = "https://allsports-front.2points.fr/payloads/background.png"
        watermarkUrl = "https://allsports-front.2points.fr/payloads/low_logo_watermark.png"
        const { match } = req.body;



        const { background, typography } = req.body;

        // Get background image URL
        const backgroundUrl = background?.image || "https://allsports-front.2points.fr/payloads/background.png";  // Use default if no background provided
        const fontFamily = typography?.name || "Arial"; // Use the default font if none provided


        const {
        startDate,
        firstTeam,
        secondTeam,
        address, // Extract address from match
        } = match;

        const date = new Date(startDate).toISOString().split('T')[0]; // Get the date part (YYYY-MM-DD)
        const hour = new Date(startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get the time part (HH:MM)

        const team1LogoUrl = fs.existsSync(path.join(__dirname, 'public', 'ligues', 'images', `${firstTeam.logo.split('/').pop()}`))
    ? `https://allsports.2points.fr/public/ligues/images/${firstTeam.logo.split('/').pop()}`
    : firstTeam.logo;

const team2LogoUrl = fs.existsSync(path.join(__dirname, 'public', 'ligues', 'images', `${secondTeam.logo.split('/').pop()}`))
    ? `https://allsports.2points.fr/public/ligues/images/${secondTeam.logo.split('/').pop()}`
    : secondTeam.logo;

        isSquare = false
        const width = 1080;
        const height = 1920;

        const backgroundBuffer = await fetchImageBuffer(backgroundUrl);
        
        let image = sharp(backgroundBuffer).resize(width, height);

        const compositeInputs = [];

        if (watermarkUrl) {
            const watermarkBuffer = await fetchImageBuffer(watermarkUrl);
            
            const watermark = await sharp(watermarkBuffer)
                .ensureAlpha() // Ensure the image has an alpha channel
                .toFormat('png') // Ensure output is PNG for transparency
                .toBuffer();

            // Get dimensions of the watermark
            const { width: watermarkWidth, height: watermarkHeight } = await sharp(watermark).metadata();

            // Calculate the number of times to repeat the watermark
            const horizontalCount = Math.ceil(width / watermarkWidth);
            const verticalCount = Math.ceil(height / watermarkHeight);

            // Create positions for the watermark to be repeated
            for (let y = 0; y < verticalCount; y++) {
                for (let x = 0; x < horizontalCount; x++) {
                    compositeInputs.push({
                        input: watermark,
                        left: x * watermarkWidth,
                        top: y * watermarkHeight,
                        blend: 'over',
                        opacity: 0.2 // Set the opacity for the watermark here
                    });
                }
            }
        }

        // Load and process team logos
        const team1LogoBuffer = await fetchImageBuffer(team1LogoUrl);
        const team2LogoBuffer = await fetchImageBuffer(team2LogoUrl);

        // Process team logos and add to composite inputs
        const team1Logo = await sharp(team1LogoBuffer)
        .resize({ width: 200, height: 200 })
        .toBuffer();
    const team2Logo = await sharp(team2LogoBuffer)
        .resize({ width: 200, height: 200 })
        .toBuffer();

    // Position the team logos
    compositeInputs.push(
        { input: team1Logo, left: (width / 2) - 320, top: (height / 2) - 100 }, // Adjusted left position for larger logos
        { input: team2Logo, left: (width / 2) + 120, top: (height / 2) - 100 }
    );


        // Load and add icon if provided
        if (iconUrl) {
            const iconBuffer = await fetchImageBuffer(iconUrl);
            const icon = await sharp(iconBuffer)
                .resize({ width:120, height: 120 })
                .toBuffer();

            compositeInputs.push({ input: icon, left: width / 2 -60, top: height - 190 });
        }

        const formattedTime = hour.replace(/(AM|PM)/, ' $1');
const combinedDateTime = `${date} ${hour}`;

// Parse the combined date-time string to a Date object
const date_ = parse(combinedDateTime, 'yyyy-MM-dd hh:mm a', new Date());


    // Format the date and hour separately
    const formattedDate = format(date_, "EEEE d MMMM", { locale: fr });
    const formattedHour = format(date_, "HH:mm", { locale: fr }).replace(':', 'H');

    // Output results
    console.log('Date:', formattedDate); // Output: "Mardi 28 Octobre"
    console.log('Hour:', formattedHour);  // Output: "10H00"

        // Prepare SVG text overlay
        const svgText = `
        <svg width="${width}" height="${height}">
            <style>
                .date { font: 36px ${fontFamily}; fill: white; }
                .hour { font: 36px ${fontFamily}; fill: white; }
                .vs { font: bold 25px ${fontFamily}; fill: white; }
                .address { font: 24px ${fontFamily}; fill: white; }
            </style>
            <text x="${width / 2}" y="120" class="date" text-anchor="middle">${formattedDate.toUpperCase()}</text>
            <text x="${width / 2}" y="160" class="hour" text-anchor="middle">${formattedHour}</text>
            <text x="${width / 2}" y="${height / 2}" class="vs" text-anchor="middle">VS</text>
            <text x="${width / 2}" y="${height - 50}" class="address" text-anchor="middle">${address.toUpperCase()}</text>
        </svg>
    `;

        const textBuffer = Buffer.from(svgText);
        // Add SVG text to composite inputs
        compositeInputs.push({ input: textBuffer, top: 0, left: 0 });
        // Add all components to the image in a single composite call
       // image = image.composite(compositeInputs);
        // Finalize the image and send it as a response
        //const outputBuffer = await image.png().toBuffer();
        // Save the output image for inspection (optional)
       // fs.writeFileSync('output.png', outputBuffer);

        // Set the response
       // res.setHeader('Content-Type', 'image/png');
       // res.send(outputBuffer);


       //
       const outputBuffer = await image.composite(compositeInputs).png().toBuffer(); // Finalize as PNG format

       // Save the final output image
       const filename = `${Date.now()}_combined.png`;
       const outputPath = path.join(imagesDirectory, filename);
   
       // Write the image to disk
       await sharp(outputBuffer).toFile(outputPath);
   
       // Generate public URL for the saved image
       const finalImageUrl = `${req.protocol}://${req.get('host')}/public/images/${filename}`;
   
       // Return the URL and the base64-encoded image buffer
       return {
           imageUrl: finalImageUrl,
           imageBuffer: outputBuffer.toString('base64')
       };
       //


    
        
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ message: 'Image generation failed' });
    }
};


const generateSquareImage = async (req, res) => {

    try {
       // const { date, hour, address, team1LogoUrl, team2LogoUrl, iconUrl, backgroundUrl, watermarkUrl } = req.body;
       iconUrl = "https://allsports-front.2points.fr/payloads/logo.png"
      /// backgroundUrl = "https://allsports-front.2points.fr/payloads/background.png"
       watermarkUrl = "https://allsports-front.2points.fr/payloads/low_logo_watermark.png"
        const { match } = req.body;

        const { background, typography } = req.body;

        // Get background image URL
        const backgroundUrl = background?.image || "https://allsports-front.2points.fr/payloads/background.png";  // Use default if no background provided
        const fontFamily = typography?.name || "Arial"; // Use the default font if none provided




        const {
        startDate,
        firstTeam,
        secondTeam,
        address, // TO DO 
        } = match;

        const date = new Date(startDate).toISOString().split('T')[0]; // Get the date part (YYYY-MM-DD)
        const hour = new Date(startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get the time part (HH:MM)

        const team1LogoUrl = fs.existsSync(path.join(__dirname, 'public', 'ligues', 'images', `${firstTeam.logo.split('/').pop()}`))
        ? `https://allsports.2points.fr/public/ligues/images/${firstTeam.logo.split('/').pop()}`
        : firstTeam.logo;
    
    const team2LogoUrl = fs.existsSync(path.join(__dirname, 'public', 'ligues', 'images', `${secondTeam.logo.split('/').pop()}`))
        ? `https://allsports.2points.fr/public/ligues/images/${secondTeam.logo.split('/').pop()}`
        : secondTeam.logo;

        const width = 1080;
        const height = 1080;
        isSquare = true
        // Load the background image
        const backgroundBuffer = await fetchImageBuffer(backgroundUrl);
        
        // Start with the background image
        let image = sharp(backgroundBuffer).resize(width, height);

        // Prepare an array for all composite inputs
        const compositeInputs = [];

        // Load and add watermark if provided
        if (watermarkUrl) {
            const watermarkBuffer = await fetchImageBuffer(watermarkUrl);
            
            // Process the watermark image to maintain transparency
            const watermark = await sharp(watermarkBuffer)
                .ensureAlpha() // Ensure the image has an alpha channel
                .toFormat('png') // Ensure output is PNG for transparency
                .toBuffer();

            // Get dimensions of the watermark
            const { width: watermarkWidth, height: watermarkHeight } = await sharp(watermark).metadata();

            // Calculate the number of times to repeat the watermark
            const horizontalCount = Math.ceil(width / watermarkWidth);
            const verticalCount = Math.ceil(height / watermarkHeight);

            // Create positions for the watermark to be repeated
            for (let y = 0; y < verticalCount; y++) {
                for (let x = 0; x < horizontalCount; x++) {
                    compositeInputs.push({
                        input: watermark,
                        left: x * watermarkWidth,
                        top: y * watermarkHeight,
                        blend: 'over',
                        opacity: 0.2 // Set the opacity for the watermark here
                    });
                }
            }
        }

        // Load and process team logos
        const team1LogoBuffer = await fetchImageBuffer(team1LogoUrl);
        const team2LogoBuffer = await fetchImageBuffer(team2LogoUrl);

        // Process team logos and add to composite inputs
        const team1Logo = await sharp(team1LogoBuffer)
        .resize({ width: 200, height: 200 })
        .toBuffer();
    const team2Logo = await sharp(team2LogoBuffer)
        .resize({ width: 200, height: 200 })
        .toBuffer();

    // Position the team logos
    compositeInputs.push(
        { input: team1Logo, left: (width / 2) - 320, top: (height / 2) - 100 }, // Adjusted left position for larger logos
        { input: team2Logo, left: (width / 2) + 120, top: (height / 2) - 100 }
    );


        // Load and add icon if provided
        if (iconUrl) {
            const iconBuffer = await fetchImageBuffer(iconUrl);
            const icon = await sharp(iconBuffer)
                .resize({ width:120, height: 120 })
                .toBuffer();

            compositeInputs.push({ input: icon, left: width / 2 -60, top: height - 190 });
        }

        const formattedTime = hour.replace(/(AM|PM)/, ' $1');
const combinedDateTime = `${date} ${hour}`;

// Parse the combined date-time string to a Date object
const date_ = parse(combinedDateTime, 'yyyy-MM-dd hh:mm a', new Date());


    // Format the date and hour separately
    const formattedDate = format(date_, "EEEE d MMMM", { locale: fr });
    const formattedHour = format(date_, "HH:mm", { locale: fr }).replace(':', 'H');

    // Output results
    console.log('Date:', formattedDate); // Output: "Mardi 28 Octobre"
    console.log('Hour:', formattedHour);  // Output: "10H00"

        // Prepare SVG text overlay
        const svgText = `
        <svg width="${width}" height="${height}">
            <style>
                .date { font: 36px ${fontFamily}; fill: white; }
                .hour { font: 36px ${fontFamily}; fill: white; }
                .vs { font: bold 25px ${fontFamily}; fill: white; }
                .address { font: 24px ${fontFamily}; fill: white; }
            </style>
            <text x="${width / 2}" y="120" class="date" text-anchor="middle">${formattedDate.toUpperCase()}</text>
            <text x="${width / 2}" y="160" class="hour" text-anchor="middle">${formattedHour}</text>
            <text x="${width / 2}" y="${height / 2}" class="vs" text-anchor="middle">VS</text>
            <text x="${width / 2}" y="${height - 50}" class="address" text-anchor="middle">${address.toUpperCase()}</text>
        </svg>
    `;

        const textBuffer = Buffer.from(svgText);
        // Add SVG text to composite inputs
        compositeInputs.push({ input: textBuffer, top: 0, left: 0 });
        // Add all components to the image in a single composite call
        const outputBuffer = await image.composite(compositeInputs).png().toBuffer(); // Finalize as PNG format

       // Save the final output image
       const filename = `${Date.now()}_combined.png`;
       const outputPath = path.join(imagesDirectory, filename);
   
       // Write the image to disk
       await sharp(outputBuffer).toFile(outputPath);
   
       // Generate public URL for the saved image
       const finalImageUrl = `${req.protocol}://${req.get('host')}/public/images/${filename}`;
   
       // Return the URL and the base64-encoded image buffer
       return {
           imageUrl: finalImageUrl,
           imageBuffer: outputBuffer.toString('base64')
       };
            
        
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ message: 'Image generation failed' });
    }
};

const createCompositeImage = async (verticalImageBase64, squareImageBase64, req, res) => {
    // Decode base64 image strings into buffers
    const verticalBuffer = Buffer.from(verticalImageBase64, 'base64');
    const squareBuffer = Buffer.from(squareImageBase64, 'base64');

    // Get metadata for the images
    const verticalImage = await sharp(verticalBuffer).metadata();
    const squareImage = await sharp(squareBuffer).metadata();

    // Calculate final dimensions
    const finalWidth = verticalImage.width + squareImage.width + 100; // Add space between images
    const finalHeight = Math.max(verticalImage.height, squareImage.height); // Use the taller height

    // Create a new blank image canvas
    const finalImage = sharp({
        create: {
            width: finalWidth,
            height: finalHeight,
            channels: 4, // RGBA
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        }
    });

    // Composite the vertical and square images onto the canvas
    const compositeInputs = [
        { input: verticalBuffer, top: (finalHeight - verticalImage.height) / 2, left: 0 }, // Align vertical image on the left
        { input: squareBuffer, top: (finalHeight - squareImage.height) / 2, left: verticalImage.width + 100 } // Align square image on the right with spacing
    ];

    // Final composite image
    const outputBuffer = await finalImage.composite(compositeInputs).png().toBuffer(); // Finalize as PNG format

    // Save the final output image
    const filename = `${Date.now()}_combined.png`;
    const outputPath = path.join(imagesDirectory, filename);

    // Write the image to disk
    await sharp(outputBuffer).toFile(outputPath);

    // Generate public URL for the saved image
    const finalImageUrl = `${req.protocol}://${req.get('host')}/public/images/${filename}`;

    // Return the URL and the base64-encoded image buffer
    return {
        imageUrl: finalImageUrl,
        imageBuffer: outputBuffer.toString('base64')
    };
};

const generateBothImages = async (req, res) => {
    try {
        // Generate the individual images and get their public URLs
const verticalImageUrl = await generateImageController(req, res, false);
const squareImageUrl = await generateSquareImage(req, res, true);
const currentDate = new Date();




// 
const CompositeImage = await createCompositeImage(verticalImageUrl.imageBuffer,squareImageUrl.imageBuffer,req,res)
// Return the public URL of the combined image
res.json({
    match:req.body.match,
    date:currentDate,
    story: verticalImageUrl.imageUrl,
    square: squareImageUrl.imageUrl,
    view: CompositeImage.imageUrl,
});


    } catch (error) {
        console.error('Error generating combined image:', error);
        res.status(500).json({ message: 'Image generation failed' });
    }
};




const saveMatchData = async (req, res) => {
    try {
        const safeData = flatted.stringify(req.body);

        const match = await Match.create({
            data: safeData, // The full match data as a JSON object
            user_id: 1, // The full match data as a JSON object

        });
        console.log('Match saved successfully with ID:', match.id);
        res.status(200).json({ match: match.id });

    } catch (error) {
        console.error('Error saving match data:', error);
    }
}



const getMatchesByUser = async (req, res) => {
    const { userId } = req.params; // Assuming userId is passed as a URL parameter

    try {
        const matches = await Match.findAll({
            where: {
                user_id: userId, // Filter matches by user_id
            },
        });

        if (!matches.length) {
            return res.status(404).json({ message: 'No matches found for this user' });
        }

        // Parse and return the matches
        const parsedMatches = matches.map(match => ({
            ...match.toJSON(),
            data: flatted.parse(match.data) // Parse the flattened JSON data for readability
        }));

        res.status(200).json(parsedMatches);
        
    } catch (error) {
        console.error('Error fetching matches by user:', error);
        res.status(500).json({ message: 'Error fetching matches' });
    }
};



module.exports = { generateImageController,generateSquareImage,generateBothImages,saveMatchData };
