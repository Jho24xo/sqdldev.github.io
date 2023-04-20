var canvas = document.querySelector('#main');
jscolor.presets.default.backgroundColor = 'rgb(61, 61, 67, 1)';
jscolor.presets.default.borderColor = 'rgb(95, 95, 110, 1)';
LevelEncryptor.setup();

var SpriteMaker = {
	Data: {
		/*LoadAll() {
			function loadImagesInSequence(images) {
			  if (!images.length) {
				return;
			  }

			  var img = new Image(),
				  url = images.shift();

			  img.onload = function(){ loadImagesInSequence(images) };
			  img.src = url;
			}
		},
		TintImage(imageSrc, tint) {
		  // Create a new canvas
		  const canvas = document.createElement('canvas');
		  const ctx = canvas.getContext('2d');

		  // Load the image onto the canvas
		  const img = new Image();
		  img.src = imageSrc;
		  img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			// Apply tint to the canvas
			ctx.fillStyle = tint;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Get the image data from the canvas
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Remove the canvas
			canvas.remove();

			// Return the image data
			return imageData;
		  };
		}*/
		TintImage(image, hexColor, ian) {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.width = image.width;
			canvas.height = image.height;
			console.log('draw ', ian);
			
			var ca = vcache.Get(ian+'.'+hexColor);
			if (ca != undefined) {
				console.log('get from cache', ian);
				
				var tintedImg = new Image();
				context.putImageData(ca, 0, 0);
				var base64 = canvas.toDataURL();
				tintedImg.src = base64;
				return tintedImg;
			}
			
			//console.log(hexColor);
			if (hexColor.toLowerCase() == '#ffffff') {
				return image;
			}
			
			function hexToRgb(hex) {
				//console.log(hex);
				if (hex.length > 6) {
					hex = hex.slice(0,7);
				}
				//console.log(hex);
				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				} : null;
			}
			context.drawImage(image, 0, 0);

			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			const len = data.length;
			
			var tintAlpha = 255;
			//console.log(hexColor);
			var color = hexToRgb(hexColor);
			if (hexColor.length == 9) {
				tintAlpha = parseInt(hexColor.slice(-2), 16);
				//console.log('tintAlpha', tintAlpha);
			}
			/*for (let i = 0; i < len; i += 4) {
				data[i] = data[i] * color[0] / 255; // red channel
				data[i + 1] = data[i + 1] * color[1] / 255; // green channel
				data[i + 2] = data[i + 2] * color[2] / 255; // blue channel
			}*/
			if (tintAlpha == 255) {
				for (let i = 0; i < len; i += 4) {
					if (data[i+3] > 5) { // check if pixel is visible before hue shift
						data[i] *= color.r / 255; // red channel
						data[i + 1] *= color.g / 255; // green channel
						data[i + 2] *= color.b / 255; // blue channel
					}
				}
			} else {
				for (let i = 0; i < len; i += 4) {
					if (data[i+3] > 5) { // check if pixel is visible before hue shift
						data[i] *= color.r / 255; // red channel
						data[i + 1] *= color.g / 255; // green channel
						data[i + 2] *= color.b / 255; // blue channel
						data[i + 3] *= tintAlpha / 255;
					}
				}
			}
			
			var tintedImg = new Image();
			context.putImageData(imageData, 0, 0);
			var base64 = canvas.toDataURL();
			tintedImg.src = base64;
			vcache.Add(ian+'.'+hexColor, imageData);
			return tintedImg;
		},
	
		Draw(sprite, canvas) {
			//const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.globalAlpha = 1;
			
			function loadInOrder(imgArray) {
				let i = 0;
				const numImages = imgArray.length;

				function loadImage() {
					const img = imgArray[i];
					try {
						function next() {
							context.drawImage(img, 0, 0);
							i++;
							if (i < numImages) {
								loadImage();
							}
						}
						if (img.src.startsWith('data')) {
						} else {
							next();
						}
						img.addEventListener('load', next);
						img.addEventListener('error', next);
					} catch {
						console.log('image error', imgArray[i], imgArray);
					}
				}

				loadImage();
			}
			
			var f = [];
			
			//Draw tinted image
			function j(ian, pn, pv) {
				if (!pn && !pv) {
					f.push(SpriteMaker.Data.TintImage(ImageAssets[ian], '#ffffff', ian));
					return;
				}
				f.push(SpriteMaker.Data.TintImage(ImageAssets[ian], sprite.GetProperty(pn, pv), ian));
			}
			
			//Fill canvas
			function h(pn, pv) {
				var temp = context.fillStyle;
				//context.clearRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = sprite.GetProperty(pn, pv);
				console.log('fill bg', context.fillStyle);
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = temp;
			}
			
			var spritesheetType = sprite.Type;
			switch (spritesheetType) {
				case 0:
				j('enemy_laserCenterBackground', 'Laser_Center', 'Laser_Center');
				j('enemy_laserCenter', 'Laser_Center', 'Laser_Color');
				var laserMode = sprite.GetValue('Laser_Beam', 'Mode');
				switch (laserMode) {
					case 0: // single beam
					j('enemy_laserBeamBackground', 'Laser_Beam', 'Laser_Center_1');
					j('enemy_laserBeam', 'Laser_Beam', 'Laser_Color_1');
					break;
					case 1: // double beam
					j('enemy_laserBeam1Background', 'Laser_Beam', 'Laser_Center_1');
					j('enemy_laserBeam1', 'Laser_Beam', 'Laser_Color_1');
					j('enemy_laserBeam2Background', 'Laser_Beam', 'Laser_Center_1');
					j('enemy_laserBeam2', 'Laser_Beam', 'Laser_Color_1');
					j('enemy_laserBeam3Background', 'Laser_Beam', 'Laser_Center_2');
					j('enemy_laserBeam3', 'Laser_Beam', 'Laser_Color_2');
					j('enemy_laserBeam4Background', 'Laser_Beam', 'Laser_Center_2');
					j('enemy_laserBeam4', 'Laser_Beam', 'Laser_Color_2');
					break;
					case 2: // quad beam
					j('enemy_laserBeam1Background', 'Laser_Beam', 'Laser_Center_1');
					j('enemy_laserBeam1', 'Laser_Beam', 'Laser_Color_1');
					j('enemy_laserBeam2Background', 'Laser_Beam', 'Laser_Center_2');
					j('enemy_laserBeam2', 'Laser_Beam', 'Laser_Color_2');
					j('enemy_laserBeam3Background', 'Laser_Beam', 'Laser_Center_3');
					j('enemy_laserBeam3', 'Laser_Beam', 'Laser_Color_3');
					j('enemy_laserBeam4Background', 'Laser_Beam', 'Laser_Center_4');
					j('enemy_laserBeam4', 'Laser_Beam', 'Laser_Color_4');
					break;
				}
				var stripesLeftType = sprite.GetValue('Main_Stripe', 'Type');
				j('enemy_stripeBackgroundLeft', 'Main_Stripe', 'Background');
				switch (stripesLeftType) {
					case 0: //none
					break;
					case 1: //default
					j('enemy_stripeDefaultColorLeft', 'Main_Stripe', 'Color');
					j('enemy_stripeDefaultShadowLeft', 'Main_Stripe', 'Shadow');
					break;
					case 2: //split
					j('enemy_stripeSplitColorLeft', 'Main_Stripe', 'Color');
					j('enemy_stripeSplitShadowLeft', 'Main_Stripe', 'Shadow');
					break;
					case 3: //wide
					j('enemy_stripeWideColorLeft', 'Main_Stripe', 'Color');
					j('enemy_stripeWideShadowLeft', 'Main_Stripe', 'Shadow');
					break;
				}
				var stripesRightType = sprite.GetValue('Alternate_Stripe', 'Type');
				j('enemy_stripeBackgroundRight', 'Alternate_Stripe', 'Background');
				switch (stripesRightType) {
					case 0: //none
					break;
					case 1: //default
					j('enemy_stripeDefaultColorRight', 'Alternate_Stripe', 'Color');
					j('enemy_stripeDefaultShadowRight', 'Alternate_Stripe', 'Shadow');
					break;
					case 2: //split
					j('enemy_stripeSplitColorRight', 'Alternate_Stripe', 'Color');
					j('enemy_stripeSplitShadowRight', 'Alternate_Stripe', 'Shadow');
					break;
					case 3: //wide
					j('enemy_stripeWideColorRight', 'Alternate_Stripe', 'Color');
					j('enemy_stripeWideShadowRight', 'Alternate_Stripe', 'Shadow');
					break;
				}
				var topRightType = sprite.GetValue('Top_Right', 'Type');
				switch (topRightType) {
					case 0: //spikes
					j('enemy_topRightBackgroundWide', 'Top_Right', 'Background');
					j('enemy_topRightStarColor_l', 'Top_Right', 'Star_Inactive_Color');
					j('enemy_topRightStarColor_r', 'Top_Right', 'Star_Active_Color');
					j('enemy_topRightStarShadow_l', 'Top_Right', 'Star_Inactive_Shadow_Color');
					j('enemy_topRightStarShadow_r', 'Top_Right', 'Star_Active_Shadow_Color');
					break;
					case 1: //pallet
					var topRightBackgroundType = sprite.GetValue('Top_Right', 'Background_Type');
					if (topRightBackgroundType == 1) {
						j('enemy_topRightBackgroundPallet', 'Top_Right', 'Background');
					} else {
						j('enemy_topRightBackground', 'Top_Right', 'Background');
					}
					var topRightGradientType = sprite.GetValue('Top_Right', 'Gradient');
					if (topRightGradientType == 1) {
						j('enemy_topRightGradient', 'Top_Right', 'Pallet_Gradient');
					}
					var topRightMinijumpType = sprite.GetValue('Top_Right', 'Mini_Jump');
					if (topRightMinijumpType == 1) {
						j('enemy_topRightSmallJump1', 'Top_Right', 'Inactive_Mini_Jump_Top');
						j('enemy_topRightSmallJump2', 'Top_Right', 'Inactive_Mini_Jump_Side');
						j('enemy_topRightSmallJump3', 'Top_Right', 'Active_Mini_Jump_Top');
						j('enemy_topRightSmallJump4', 'Top_Right', 'Active_Mini_Jump_Side');
					}
					var topRightFlipType = sprite.GetValue('Top_Right', 'Flip_Tile');
					if (topRightFlipType != 0) {
						j('enemy_topRightFlipTile-0-1', 'Top_Right', 'Inactive_Flip_Tile_Background');
						j('enemy_topRightFlipTile-0-2', 'Top_Right', 'Active_Flip_Tile_Background');
					}
					switch (topRightFlipType) {
						case 0: //none
						break;
						case 1: //hourglass
							j('enemy_topRightFlipTile-1-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-1-2', 'Top_Right', 'Active_Flip_Tile_Color_1');
						break;
						case 2: //checkerboard
							j('enemy_topRightFlipTile-2-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-2-2', 'Top_Right', 'Active_Flip_Tile_Color_1');
						break;
						case 3: //flower
							j('enemy_topRightFlipTile-3-1-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-3-1-2', 'Top_Right', 'Inactive_Flip_Tile_Color_2');
							j('enemy_topRightFlipTile-3-2-1', 'Top_Right', 'Active_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-3-2-2', 'Top_Right', 'Active_Flip_Tile_Color_2');
						break;
						case 4: //diamond
							j('enemy_topRightFlipTile-4-1-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-4-1-2', 'Top_Right', 'Inactive_Flip_Tile_Color_2');
							j('enemy_topRightFlipTile-4-2-1', 'Top_Right', 'Active_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-4-2-2', 'Top_Right', 'Active_Flip_Tile_Color_2');
						break;
						case 5: //triple square
							j('enemy_topRightFlipTile-5-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-5-2', 'Top_Right', 'Active_Flip_Tile_Color_1');
						break;
						case 6: //u shape
							j('enemy_topRightFlipTile-6-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-6-2', 'Top_Right', 'Active_Flip_Tile_Color_1');
						break;
						case 7: //boxed star
							j('enemy_topRightFlipTile-7-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-7-2', 'Top_Right', 'Active_Flip_Tile_Color_1');
						break;
						case 8: //quad circle
							j('enemy_topRightFlipTile-8-1-1', 'Top_Right', 'Inactive_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-8-1-2', 'Top_Right', 'Inactive_Flip_Tile_Color_2');
							j('enemy_topRightFlipTile-8-2-1', 'Top_Right', 'Active_Flip_Tile_Color_1');
							j('enemy_topRightFlipTile-8-2-2', 'Top_Right', 'Active_Flip_Tile_Color_2');
						break;
					}
					var topRightPowerupType = sprite.GetValue('Top_Right', 'Powerups');
					if (topRightPowerupType != 0) {
						j('enemy_topRightPowerupsBase');
						j('enemy_topRightPowerupsGradient', 'Top_Right', 'Powerup_Custom_Gradient');
					}
					break;
				}
				
				j('enemy_riserBackground', 'Riser_Top', 'Background');
				
				var colorVibrantType = sprite.GetValue('Light_Color_Pallet', 'Type');
				switch (colorVibrantType) {
					case 0: //def_a_Borderult
					j('enemy_colorVibrantBackground1', 'Light_Color_Pallet', 'Color_1_Background');
					j('enemy_colorVibrantBorder1', 'Light_Color_Pallet', 'Color_1_Border');
					j('enemy_colorVibrantBackground2', 'Light_Color_Pallet', 'Color_2_Background');
					j('enemy_colorVibrantBorder2', 'Light_Color_Pallet', 'Color_2_Border');
					j('enemy_colorVibrantBackground3', 'Light_Color_Pallet', 'Color_3_Background');
					j('enemy_colorVibrantBorder3', 'Light_Color_Pallet', 'Color_3_Border');
					j('enemy_colorVibrantBackground4', 'Light_Color_Pallet', 'Color_4_Background');
					j('enemy_colorVibrantBorder4', 'Light_Color_Pallet', 'Color_4_Border');
					j('enemy_colorVibrantBackground5', 'Light_Color_Pallet', 'Color_5_Background');
					j('enemy_colorVibrantBorder5', 'Light_Color_Pallet', 'Color_5_Border');
					j('enemy_colorVibrantBackground6', 'Light_Color_Pallet', 'Color_6_Background');
					j('enemy_colorVibrantBorder6', 'Light_Color_Pallet', 'Color_6_Border');
					break;
				}
				var colorDullType = sprite.GetValue('Dark_Color_Pallet', 'Type');
				switch (colorDullType) {
					case 0: //def_a_Borderult
					j('enemy_colorDullBackground1', 'Dark_Color_Pallet', 'Color_1_Background');
					j('enemy_colorDullBorder1', 'Dark_Color_Pallet', 'Color_1_Border');
					j('enemy_colorDullBackground2', 'Dark_Color_Pallet', 'Color_2_Background');
					j('enemy_colorDullBorder2', 'Dark_Color_Pallet', 'Color_2_Border');
					j('enemy_colorDullBackground3', 'Dark_Color_Pallet', 'Color_3_Background');
					j('enemy_colorDullBorder3', 'Dark_Color_Pallet', 'Color_3_Border');
					j('enemy_colorDullBackground4', 'Dark_Color_Pallet', 'Color_4_Background');
					j('enemy_colorDullBorder4', 'Dark_Color_Pallet', 'Color_4_Border');
					j('enemy_colorDullBackground5', 'Dark_Color_Pallet', 'Color_5_Background');
					j('enemy_colorDullBorder5', 'Dark_Color_Pallet', 'Color_5_Border');
					j('enemy_colorDullBackground6', 'Dark_Color_Pallet', 'Color_6_Background');
					j('enemy_colorDullBorder6', 'Dark_Color_Pallet', 'Color_6_Border');
					break;
				}
				
				var sectionGradientType = sprite.GetValue('Gradient', 'Type');
				switch (sectionGradientType) {
					case 0: // one
					j('enemy_gradient1Lighten', 'Gradient', 'Lighten_Color');
					j('enemy_gradient1Darken', 'Gradient', 'Darken_Color');
					j('enemy_gradient1StripLighten', 'Gradient', 'Strip_Lighten_Color');
					j('enemy_gradient1StripDarken', 'Gradient', 'Strip_Darken_Color');
					j('enemy_gradient1BorderThick', 'Gradient', 'Border_Color');
					break;
					case 1: // two
					j('enemy_gradient2Lighten', 'Gradient', 'Lighten_Color');
					j('enemy_gradient2Darken', 'Gradient', 'Darken_Color');
					j('enemy_gradient2StripLighten', 'Gradient', 'Strip_Lighten_Color');
					j('enemy_gradient2StripDarken', 'Gradient', 'Strip_Darken_Color');
					break;
				}
				
				var sectionRiserType = sprite.GetValue('Riser_Top', 'Type');
				switch (sectionRiserType) {
					case 0: // one
					j('enemy_riser1OuterBorderLeft', 'Riser_Top', 'Left_Outer_Border');
					j('enemy_riser1InnerColorLeft', 'Riser_Top', 'Left_Inner_Color');
					j('enemy_riser1InnerBorderLeft', 'Riser_Top', 'Left_Inner_Border');
					j('enemy_riser1OuterBorderRight', 'Riser_Top', 'Right_Outer_Border');
					j('enemy_riser1InnerColorRight', 'Riser_Top', 'Right_Inner_Color');
					j('enemy_riser1InnerBorderRight', 'Riser_Top', 'Right_Inner_Border');
					break;
					case 1: // two
					j('enemy_riser2InnerColorLeft', 'Riser_Top', 'Left_Inner_Color');
					j('enemy_riser2InnerColorRight', 'Riser_Top', 'Right_Inner_Color');
					j('enemy_riser2OuterColorLeft', 'Riser_Top', 'Left_Inner_Border');
					j('enemy_riser2OuterColorRight', 'Riser_Top', 'Right_Inner_Border');
					break;
				}
				
				AssignHitboxes([
					[0, 0, 128, 128, 'Laser_Center'],
					[128, 0, 52, 128, 'Laser_Beam'],
					[192, 0, 320, 128, 'Top_Right'],
					[0, 128, 256, 64, 'Main_Stripe'],
					[256, 128, 256, 64, 'Alternate_Stripe'],
					[0, 192, 256, 203, 'Light_Color_Pallet'],
					[256, 192, 256, 192, 'Dark_Color_Pallet'],
					[0, 395, 256, 117, 'Gradient'],
					[256, 384, 256, 128, 'Riser_Top']
				]);
				break;
				case 1:
				h('General', 'Background');
				
				function t001() {
					var borderType = sprite.GetValue('General', 'Border_Style');
					switch (borderType) {
						case 0: // default
						j('general_mainBorder1', 'General', 'Border');
						j('general_mainPallet1Shadow', 'Pallet', 'Shadow');
						j('general_mainPallet11', 'Pallet', 'Square_1');
						j('general_mainPallet11Overlay', 'Pallet', 'Square_1_Overlay');
						j('general_mainPallet12', 'Pallet', 'Square_2');
						j('general_mainPallet12Overlay', 'Pallet', 'Square_2_Overlay');
						j('general_mainPallet13', 'Pallet', 'Square_3');
						j('general_mainPallet14', 'Pallet', 'Square_4');
						j('general_mainPallet14Overlay', 'Pallet', 'Square_4_Overlay');
						j('general_mainPallet15', 'Pallet', 'Square_5');
						break;
						case 1: // sky
						j('general_mainBorder2Bottom', 'General', 'Lower_Border');
						j('general_mainBorder2Top', 'General', 'Border');
						j('general_mainPallet2Shadow', 'Pallet', 'Shadow');
						j('general_mainPallet21', 'Pallet', 'Square_1');
						j('general_mainPallet21Overlay', 'Pallet', 'Square_1_Overlay');
						j('general_mainPallet22', 'Pallet', 'Square_2');
						j('general_mainPallet22Overlay', 'Pallet', 'Square_2_Overlay');
						j('general_mainPallet23', 'Pallet', 'Square_3');
						j('general_mainPallet24', 'Pallet', 'Square_4');
						j('general_mainPallet24Overlay', 'Pallet', 'Square_4_Overlay');
						j('general_mainPallet25', 'Pallet', 'Square_5');
						break;
						case 2: // volcano border
						j('general_mainBorder3', 'General', 'Border');
						j('general_mainPallet1Shadow', 'Pallet', 'Shadow');
						j('general_mainPallet11', 'Pallet', 'Square_1');
						j('general_mainPallet11Overlay', 'Pallet', 'Square_1_Overlay');
						j('general_mainPallet12', 'Pallet', 'Square_2');
						j('general_mainPallet12Overlay', 'Pallet', 'Square_2_Overlay');
						j('general_mainPallet13', 'Pallet', 'Square_3');
						j('general_mainPallet14', 'Pallet', 'Square_4');
						j('general_mainPallet14Overlay', 'Pallet', 'Square_4_Overlay');
						j('general_mainPallet15', 'Pallet', 'Square_5');
						break;
						case 3: // illusion glow
						j('general_mainBorder4', 'General', 'Border');
						j('general_mainPallet1Shadow', 'Pallet', 'Shadow');
						j('general_mainPallet11', 'Pallet', 'Square_1');
						j('general_mainPallet11Overlay', 'Pallet', 'Square_1_Overlay');
						j('general_mainPallet12', 'Pallet', 'Square_2');
						j('general_mainPallet12Overlay', 'Pallet', 'Square_2_Overlay');
						j('general_mainPallet13', 'Pallet', 'Square_3');
						j('general_mainPallet14', 'Pallet', 'Square_4');
						j('general_mainPallet14Overlay', 'Pallet', 'Square_4_Overlay');
						j('general_mainPallet15', 'Pallet', 'Square_5');
						break;
						case 4: // kungfu border
						j('general_mainBorder5Bottom', 'General', 'Lower_Border');
						j('general_mainBorder5Top', 'General', 'Border');
						j('general_mainPallet1Shadow', 'Pallet', 'Shadow');
						j('general_mainPallet11', 'Pallet', 'Square_1');
						j('general_mainPallet11Overlay', 'Pallet', 'Square_1_Overlay');
						j('general_mainPallet12', 'Pallet', 'Square_2');
						j('general_mainPallet12Overlay', 'Pallet', 'Square_2_Overlay');
						j('general_mainPallet13', 'Pallet', 'Square_3');
						j('general_mainPallet14', 'Pallet', 'Square_4');
						j('general_mainPallet14Overlay', 'Pallet', 'Square_4_Overlay');
						j('general_mainPallet15', 'Pallet', 'Square_5');
						break;
					}
				}
				
				var spriteType = sprite.GetValue('Top_Left', 'Type');
				switch (spriteType) {
					case 0: //general
					var jumpActiveType = sprite.GetValue('Top_Left', 'Active_Jump_Pad_Style');
					switch (jumpActiveType) {
						case 0: //default
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad1ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
						case 1: //sky ground
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad2ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
						case 2: //net
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad3ActiveDecoration', 'Top_Left', 'Active_Jump_Pad_Decoration_1');
						j('general_jumpPad1ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
						case 3: //double square
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad4ActiveDecorationCenter', 'Top_Left', 'Active_Jump_Pad_Decoration_2');
						j('general_jumpPad4ActiveDecoration', 'Top_Left', 'Active_Jump_Pad_Decoration_1');
						j('general_jumpPad4ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
						case 4: //chinese
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad5ActiveDecoration', 'Top_Left', 'Active_Jump_Pad_Decoration_1');
						j('general_jumpPad1ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
						case 5: //clowny
						j('general_jumpPad1ActiveColor', 'Top_Left', 'Active_Jump_Pad_Color');
						j('general_jumpPad6ActiveDecoration', 'Top_Left', 'Active_Jump_Pad_Decoration_1');
						j('general_jumpPad1ActiveBorder', 'Top_Left', 'Active_Jump_Pad_Border');
						j('general_jumpPad1ActivePallet', 'Top_Left', 'Active_Jump_Pad_Side');
						break;
					}
					var jumpInactiveType = sprite.GetValue('Top_Left', 'Inactive_Jump_Pad_Style');
					switch (jumpInactiveType) {
						case 0: //default
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad1Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
						case 1: //sky ground
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad2Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
						case 2: //net
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad3Decoration', 'Top_Left', 'Inactive_Jump_Pad_Decoration_1');
						j('general_jumpPad1Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
						case 3: //double square
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad4DecorationCenter', 'Top_Left', 'Inactive_Jump_Pad_Decoration_2');
						j('general_jumpPad4Decoration', 'Top_Left', 'Inactive_Jump_Pad_Decoration_1');
						j('general_jumpPad4Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
						case 4: //chinese
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad5Decoration', 'Top_Left', 'Inactive_Jump_Pad_Decoration_1');
						j('general_jumpPad1Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
						case 5: //clowny
						j('general_jumpPad1Color', 'Top_Left', 'Inactive_Jump_Pad_Color');
						j('general_jumpPad6Decoration', 'Top_Left', 'Inactive_Jump_Pad_Decoration_1');
						j('general_jumpPad1Border', 'Top_Left', 'Inactive_Jump_Pad_Border');
						j('general_jumpPad1Pallet', 'Top_Left', 'Inactive_Jump_Pad_Side');
						break;
					}
					t001();
					var decorationType = sprite.GetValue('General', 'Decoration_Type');
					switch (decorationType) {
						case 0: // no decoration
						break;
						case 1: // volcano
						j('general_decoration1', 'General', 'Decoration_Color_1');
						break;
						case 2: // desert
						j('general_decoration2', 'General', 'Decoration_Color_1');
						j('general_decoration2Outline', 'General', 'Decoration_Color_2');
						break;
					}
					break;
					case 1: //mover overlay
					t001();
					j('mover_ArrowActiveColor', 'Top_Left', 'Active_Mover_Arrow_Color');
					j('mover_ArrowActiveInnerColor', 'Top_Left', 'Active_Mover_Arrow_Inner_Color');
					j('mover_ArrowActiveBorder', 'Top_Left', 'Active_Mover_Arrow_Border');
					j('mover_ArrowActivePallet', 'Top_Left', 'Active_Mover_Arrow_Side');
					j('mover_ArrowInactiveColor', 'Top_Left', 'Inactive_Mover_Arrow_Color');
					j('mover_ArrowInactiveInnerColor', 'Top_Left', 'Inactive_Mover_Arrow_Inner_Color');
					j('mover_ArrowInactiveBorder', 'Top_Left', 'Inactive_Mover_Arrow_Border');
					j('mover_ArrowInactivePallet', 'Top_Left', 'Inactive_Mover_Arrow_Side');
					j('mover_BorderStyle1', 'Top_Left', 'Mover_Border_Outline');
					break;
				}
				
				AssignHitboxes([
					[0, 0, 341, 171, 'Top_Left'],
					[341, 0, 171, 171, 'General'],
					[0, 171, 171, 171, 'General'],
					[171, 171, 171, 171, 'Pallet'],
					[341, 171, 171, 171, 'General'],
					[0, 341, 171, 171, 'General'],
					[171, 341, 171, 171, 'General'],
					[341, 341, 171, 171, 'General']
				]);
				break;
				case 2:
				h('Fragile', 'Background');
				context.clearRect(0, 0, 341, 171); // clear checker background
				var spriteType = sprite.GetValue('Top_Left', 'Type');
				switch (spriteType) {
					case 0: //fragile
					j('fragile_topLeftLQGemColor', 'Top_Left', 'Low_Quality_Gem_Color');
					j('fragile_topLeftLQGemOutline', 'Top_Left', 'Low_Quality_Gem_Outline');
					j('fragile_topLeftLQGemOutlineHighlight', 'Top_Left', 'Low_Quality_Gem_Highlight');
					j('fragile_topLeftMidgroundLighten', 'Top_Left', 'Midground_Gradient_Top');
					j('fragile_topLeftMidgroundDarken', 'Top_Left', 'Midground_Gradient_Bottom');
					var topRightDecorationType = sprite.GetValue('Top_Left', 'Midground_Decoration');
					if (topRightDecorationType == 1) {
						//city midground window overlay before the darken pattern
					}
					break;
					case 1: //fragileactive
					j('fragileActive_checkerBottom1', 'Top_Left', 'Bottom_Checker_1');
					j('fragileActive_checkerBottom2', 'Top_Left', 'Bottom_Checker_2');
					j('fragileActive_checkerTop1', 'Top_Left', 'Top_Checker_1');
					j('fragileActive_checkerTop2', 'Top_Left', 'Top_Checker_2');
					var highscoreStyle = sprite.GetValue('Top_Left', 'Highscore_Style');
					switch (highscoreStyle) {
						case 0: //original
						j('fragileActive_highscoreTop1Outline', 'Top_Left', 'Top_Highscore_Outline');
						j('fragileActive_highscoreTop1', 'Top_Left', 'Top_Highscore_Color');
						j('fragileActive_highscoreBottom1', 'Top_Left', 'Bottom_Highscore_Color');
						break;
						case 1: //new font, bottom glow
						j('fragileActive_highscoreTop2', 'Top_Left', 'Top_Highscore_Color');
						j('fragileActive_highscoreBottom2', 'Top_Left', 'Bottom_Highscore_Color');
						break;
						case 2: //new font, no glow
						j('fragileActive_highscoreTop2', 'Top_Left', 'Top_Highscore_Color');
						j('fragileActive_highscoreBottom3', 'Top_Left', 'Bottom_Highscore_Color');
						break;
					}
					break;
				}
				var borderType = sprite.GetValue('Fragile', 'Border_Style');
				switch (borderType) {
					case 0: //massif border
					j('fragile_border1', 'Fragile', 'Border');
					j('fragile_border1Outline', 'Fragile', 'Border');
					j('fragile_border1Stripe', 'Fragile', 'Stripes');
					break;
					case 1: //sky border
					j('fragile_border1', 'Fragile', 'Border');
					j('fragile_border2Outline', 'Fragile', 'Border');
					j('fragile_border2Stripe', 'Fragile', 'Stripes');
					break;
					case 2: //modern border
					j('fragile_border2', 'Fragile', 'Border');
					break;
					case 3: //80
					j('fragile_border2', 'Fragile', 'Border');
					j('fragile_border1Stripe', 'Fragile', 'Stripes');
					break;
					case 4: //line border
					j('fragile_border1', 'Fragile', 'Border');
					break;
					case 5: //ajr border
					j('fragile_border3', 'Fragile', 'Border');
					j('fragile_border3Abstract', 'Fragile', 'Border');
					break;
				}
				var decorationType = sprite.GetValue('Fragile', 'Decoration_Type');
				switch (decorationType) {
					case 0: //none
					break;
					case 1: //pixelate
					j('fragile_decoration1', 'Fragile', 'Border');
					break;
					case 2: //snowflake
					j('fragile_decoration2', 'Fragile', 'Border');
					break;
				}
				j('general_mainPallet1Shadow', 'Pallet', 'Shadow');
				j('general_mainPallet11', 'Pallet', 'Square_1');
				j('general_mainPallet11Overlay', 'Pallet', 'Square_1_Overlay');
				j('general_mainPallet12', 'Pallet', 'Square_2');
				j('general_mainPallet12Overlay', 'Pallet', 'Square_2_Overlay');
				j('general_mainPallet13', 'Pallet', 'Square_3');
				j('general_mainPallet14', 'Pallet', 'Square_4');
				j('general_mainPallet14Overlay', 'Pallet', 'Square_4_Overlay');
				j('general_mainPallet15', 'Pallet', 'Square_5');
				
				AssignHitboxes([
					[0, 0, 341, 171, 'Top_Left'],
					[341, 0, 171, 171, 'Fragile'],
					[0, 171, 171, 171, 'Fragile'],
					[171, 171, 171, 171, 'Pallet'],
					[341, 171, 171, 171, 'Fragile'],
					[0, 341, 171, 171, 'Fragile'],
					[171, 341, 171, 171, 'Fragile'],
					[341, 341, 171, 171, 'Fragile']
				]);
				break;
			}
			
			loadInOrder(f);
		}

	},
	Initialize() {
	
	var memory = navigator.deviceMemory;
	var cacheMax = 10;
	if (memory != undefined) {
		cacheMax = Math.round(((memory-8)+10)*1.5)+10;
	}
	
	window.vcache = new VariableCache(cacheMax);
	window.sprite = new Spritesheet(cachedSpriteData[0]);

//SpriteMaker.Data.Draw(sprite, canvas);

	}
};

const ImageSources = {
	// Enemy
		// Laser
		"enemy_laserCenter": "enemy/laser_center_color",
		"enemy_laserCenterBackground": "enemy/laser_center_background",
		"enemy_laserBeam": "enemy/laser_beam_color",
		"enemy_laserBeamBackground": "enemy/laser_beam_background",
		"enemy_laserBeam1": "enemy/laser_beam_1_color",
		"enemy_laserBeam1Background": "enemy/laser_beam_1_background",
		"enemy_laserBeam2": "enemy/laser_beam_2_color",
		"enemy_laserBeam2Background": "enemy/laser_beam_2_background",
		"enemy_laserBeam3": "enemy/laser_beam_3_color",
		"enemy_laserBeam3Background": "enemy/laser_beam_3_background",
		"enemy_laserBeam4": "enemy/laser_beam_4_color",
		"enemy_laserBeam4Background": "enemy/laser_beam_4_background",
		
		// TopRight
		"enemy_topRightBackground": "enemy/top_right_background",
		"enemy_topRightBackgroundWide": "enemy/top_right_background_wide",
		//"enemy_topRightGradients1": "enemy/top_right_gradients1",
		"enemy_topRightSolids": "enemy/top_right_solids",
		/*"enemy_topRightStarBorder_l": "enemy/top_right_star_border_l",
		"enemy_topRightStarBorder_r": "enemy/top_right_star_border_r",*/
		"enemy_topRightStarColor_l": "enemy/top_right_star_color_l",
		"enemy_topRightStarColor_r": "enemy/top_right_star_color_r",
		"enemy_topRightStarShadow_l": "enemy/top_right_star_shadow_l",
		"enemy_topRightStarShadow_r": "enemy/top_right_star_shadow_r",
		
		//topright pallet
		"enemy_topRightFlipTile-0-1": "enemy/topright/flip_tile_0_1",
		"enemy_topRightFlipTile-0-2": "enemy/topright/flip_tile_0_2",
		"enemy_topRightFlipTile-1-1": "enemy/topright/flip_tile_1_1",
		"enemy_topRightFlipTile-1-2": "enemy/topright/flip_tile_1_2",
		"enemy_topRightFlipTile-2-1": "enemy/topright/flip_tile_2_1",
		"enemy_topRightFlipTile-2-2": "enemy/topright/flip_tile_2_2",
		"enemy_topRightFlipTile-3-1-1": "enemy/topright/flip_tile_3_1_1",
		"enemy_topRightFlipTile-3-1-2": "enemy/topright/flip_tile_3_1_2",
		"enemy_topRightFlipTile-3-2-1": "enemy/topright/flip_tile_3_2_1",
		"enemy_topRightFlipTile-3-2-2": "enemy/topright/flip_tile_3_2_2",
		"enemy_topRightFlipTile-4-1-1": "enemy/topright/flip_tile_4_1_1",
		"enemy_topRightFlipTile-4-1-2": "enemy/topright/flip_tile_4_1_2",
		"enemy_topRightFlipTile-4-2-1": "enemy/topright/flip_tile_4_2_1",
		"enemy_topRightFlipTile-4-2-2": "enemy/topright/flip_tile_4_2_2",
		"enemy_topRightFlipTile-5-1": "enemy/topright/flip_tile_5_1",
		"enemy_topRightFlipTile-5-2": "enemy/topright/flip_tile_5_2",
		"enemy_topRightFlipTile-6-1": "enemy/topright/flip_tile_6_1",
		"enemy_topRightFlipTile-6-2": "enemy/topright/flip_tile_6_2",
		"enemy_topRightFlipTile-7-1": "enemy/topright/flip_tile_7_1",
		"enemy_topRightFlipTile-7-2": "enemy/topright/flip_tile_7_2",
		"enemy_topRightFlipTile-8-1-1": "enemy/topright/flip_tile_8_1_1",
		"enemy_topRightFlipTile-8-1-2": "enemy/topright/flip_tile_8_1_2",
		"enemy_topRightFlipTile-8-2-1": "enemy/topright/flip_tile_8_2_1",
		"enemy_topRightFlipTile-8-2-2": "enemy/topright/flip_tile_8_2_2",
		
		"enemy_topRightBackgroundPallet": "enemy/topright/basic_pallet",
		
		"enemy_topRightGradient": "enemy/topright/gradient",
		"enemy_topRightPowerupsBase": "enemy/topright/powerups_base",
		"enemy_topRightPowerupsGradient": "enemy/topright/powerups_gradient",
		"enemy_topRightSmallJump1": "enemy/topright/small_jump_1",
		"enemy_topRightSmallJump2": "enemy/topright/small_jump_2",
		"enemy_topRightSmallJump3": "enemy/topright/small_jump_3",
		"enemy_topRightSmallJump4": "enemy/topright/small_jump_4",
		
		// Stripes
		"enemy_stripeDefaultShadowLeft": "enemy/stripe_default_shadow_left",
		"enemy_stripeDefaultColorLeft": "enemy/stripe_default_color_left",
		"enemy_stripeDefaultShadowRight": "enemy/stripe_default_shadow_right",
		"enemy_stripeDefaultColorRight": "enemy/stripe_default_color_right",
		
		"enemy_stripeSplitShadowLeft": "enemy/stripe_split_shadow_left",
		"enemy_stripeSplitColorLeft": "enemy/stripe_split_color_left",
		"enemy_stripeSplitShadowRight": "enemy/stripe_split_shadow_right",
		"enemy_stripeSplitColorRight": "enemy/stripe_split_color_right",
		
		"enemy_stripeWideShadowLeft": "enemy/stripe_wide_shadow_left",
		"enemy_stripeWideColorLeft": "enemy/stripe_wide_color_left",
		"enemy_stripeWideShadowRight": "enemy/stripe_wide_shadow_right",
		"enemy_stripeWideColorRight": "enemy/stripe_wide_color_right",
		
		"enemy_stripeBackgroundLeft": "enemy/stripe_background_left",
		"enemy_stripeBackgroundRight": "enemy/stripe_background_right",
		
		// Vibrant
		"enemy_colorVibrantBackground1": "enemy/color_vibrant_background_1",
		"enemy_colorVibrantBorder1": "enemy/color_vibrant_border_1",
		"enemy_colorVibrantBackground2": "enemy/color_vibrant_background_2",
		"enemy_colorVibrantBorder2": "enemy/color_vibrant_border_2",
		"enemy_colorVibrantBackground3": "enemy/color_vibrant_background_3",
		"enemy_colorVibrantBorder3": "enemy/color_vibrant_border_3",
		"enemy_colorVibrantBackground4": "enemy/color_vibrant_background_4",
		"enemy_colorVibrantBorder4": "enemy/color_vibrant_border_4",
		"enemy_colorVibrantBackground5": "enemy/color_vibrant_background_5",
		"enemy_colorVibrantBorder5": "enemy/color_vibrant_border_5",
		"enemy_colorVibrantBackground6": "enemy/color_vibrant_background_6",
		"enemy_colorVibrantBorder6": "enemy/color_vibrant_border_6",
		// Dull
		"enemy_colorDullBackground1": "enemy/color_dull_background_1",
		"enemy_colorDullBorder1": "enemy/color_dull_border_1",
		"enemy_colorDullBackground2": "enemy/color_dull_background_2",
		"enemy_colorDullBorder2": "enemy/color_dull_border_2",
		"enemy_colorDullBackground3": "enemy/color_dull_background_3",
		"enemy_colorDullBorder3": "enemy/color_dull_border_3",
		"enemy_colorDullBackground4": "enemy/color_dull_background_4",
		"enemy_colorDullBorder4": "enemy/color_dull_border_4",
		"enemy_colorDullBackground5": "enemy/color_dull_background_5",
		"enemy_colorDullBorder5": "enemy/color_dull_border_5",
		"enemy_colorDullBackground6": "enemy/color_dull_background_6",
		"enemy_colorDullBorder6": "enemy/color_dull_border_6",
		
		// Gradient 1
		"enemy_gradient1BorderThick": "enemy/gradient_1_border_thick",
		"enemy_gradient1BorderThin": "enemy/gradient_1_border_thin",
		"enemy_gradient1Darken": "enemy/gradient_1_darken",
		"enemy_gradient1Lighten": "enemy/gradient_1_lighten",
		"enemy_gradient1StripDarken": "enemy/gradient_1_strip_darken",
		"enemy_gradient1StripLighten": "enemy/gradient_1_strip_lighten",
		// Gradient 2
		"enemy_gradient2Darken": "enemy/gradient_2_darken",
		"enemy_gradient2Lighten": "enemy/gradient_2_lighten",
		"enemy_gradient2StripDarken": "enemy/gradient_2_strip_darken",
		"enemy_gradient2StripLighten": "enemy/gradient_2_strip_lighten",
		
		// Riser background
		"enemy_riserBackground": "enemy/riser_background",
		
		// Riser
		"enemy_riser1InnerColorLeft": "enemy/riser_1_inner_color_left",
		"enemy_riser1InnerColorRight": "enemy/riser_1_inner_color_right",
		"enemy_riser1InnerBorderLeft": "enemy/riser_1_inner_border_left",
		"enemy_riser1InnerBorderRight": "enemy/riser_1_inner_border_right",
		"enemy_riser1OuterBorderLeft": "enemy/riser_1_outer_border_left",
		"enemy_riser1OuterBorderRight": "enemy/riser_1_outer_border_right",
		"enemy_riser2InnerColorLeft": "enemy/riser_2_inner_color_left",
		"enemy_riser2InnerColorRight": "enemy/riser_2_inner_color_right",
		"enemy_riser2OuterColorLeft": "enemy/riser_2_outer_color_left",
		"enemy_riser2OuterColorRight": "enemy/riser_2_outer_color_right",
		
	// General
		"general_jumpPad1ActiveBorder": "general/jump_pad_1_active_border",
		"general_jumpPad1ActiveColor": "general/jump_pad_1_active_color",
		"general_jumpPad1ActivePallet": "general/jump_pad_1_active_pallet",
		"general_jumpPad2ActiveBorder": "general/jump_pad_2_active_border",
		"general_jumpPad3ActiveDecoration": "general/jump_pad_3_active_decoration",
		"general_jumpPad4ActiveBorder": "general/jump_pad_4_active_border",
		"general_jumpPad4ActiveDecoration": "general/jump_pad_4_active_decoration",
		"general_jumpPad4ActiveDecorationCenter": "general/jump_pad_4_active_decoration_center",
		"general_jumpPad5ActiveDecoration": "general/jump_pad_5_active_decoration",
		"general_jumpPad6ActiveDecoration": "general/jump_pad_6_active_decoration",
		"general_jumpPad1Border": "general/jump_pad_1_border",
		"general_jumpPad1Color": "general/jump_pad_1_color",
		"general_jumpPad1Pallet": "general/jump_pad_1_pallet",
		"general_jumpPad2Border": "general/jump_pad_2_border",
		"general_jumpPad3Decoration": "general/jump_pad_3_decoration",
		"general_jumpPad4Border": "general/jump_pad_4_border",
		"general_jumpPad4Decoration": "general/jump_pad_4_decoration",
		"general_jumpPad4DecorationCenter": "general/jump_pad_4_decoration_center",
		"general_jumpPad5Decoration": "general/jump_pad_5_decoration",
		"general_jumpPad6Decoration": "general/jump_pad_6_decoration",
		"general_decoration1": "general/decoration_1",
		"general_decoration2": "general/decoration_2",
		"general_decoration2Outline": "general/decoration_2_outline",
		"general_mainBorder1": "general/main_border_1",
		"general_mainBorder2Top": "general/main_border_2_top",
		"general_mainBorder2Bottom": "general/main_border_2_bottom",
		"general_mainBorder3": "general/main_border_3",
		"general_mainBorder4": "general/main_border_4",
		"general_mainBorder5Top": "general/main_border_5_top",
		"general_mainBorder5Bottom": "general/main_border_5_bottom",
		"general_mainPallet1Shadow": "general/main_pallet_1_shadow",
		"general_mainPallet11": "general/main_pallet_1_1",
		"general_mainPallet11Overlay": "general/main_pallet_1_1_overlay",
		"general_mainPallet12": "general/main_pallet_1_2",
		"general_mainPallet12Overlay": "general/main_pallet_1_2_overlay",
		"general_mainPallet13": "general/main_pallet_1_3",
		"general_mainPallet14": "general/main_pallet_1_4",
		"general_mainPallet14Overlay": "general/main_pallet_1_4_overlay",
		"general_mainPallet15": "general/main_pallet_1_5",
		"general_mainPallet2Shadow": "general/main_pallet_2_shadow",
		"general_mainPallet21": "general/main_pallet_2_1",
		"general_mainPallet21Overlay": "general/main_pallet_2_1_overlay",
		"general_mainPallet22": "general/main_pallet_2_2",
		"general_mainPallet22Overlay": "general/main_pallet_2_2_overlay",
		"general_mainPallet23": "general/main_pallet_2_3",
		"general_mainPallet24": "general/main_pallet_2_4",
		"general_mainPallet24Overlay": "general/main_pallet_2_4_overlay",
		"general_mainPallet25": "general/main_pallet_2_5",
		
		//mover overlay
		"mover_BorderStyle1": "mover/border_style_1",
		"mover_ArrowActiveBorder": "mover/arrow_active_border",
		"mover_ArrowActiveColor": "mover/arrow_active_color",
		"mover_ArrowActiveInnerColor": "mover/arrow_active_inner_color",
		"mover_ArrowActivePallet": "mover/arrow_active_pallet",
		"mover_ArrowInactiveBorder": "mover/arrow_inactive_border",
		"mover_ArrowInactiveColor": "mover/arrow_inactive_color",
		"mover_ArrowInactiveInnerColor": "mover/arrow_inactive_inner_color",
		"mover_ArrowInactivePallet": "mover/arrow_inactive_pallet",
	
	// Fragile
		"fragile_border1Outline": "fragile/border_1_outline",
		"fragile_border1Stripe": "fragile/border_1_stripe",
		"fragile_border2Outline": "fragile/border_2_outline",
		"fragile_border2Stripe": "fragile/border_2_stripe",
		"fragile_border3Abstract": "fragile/border_3_abstract",
		"fragile_decoration1": "fragile/decoration_1",
		"fragile_decoration2": "fragile/decoration_2",
		"fragile_border1": "fragile/border_1",
		"fragile_border2": "fragile/border_2",
		"fragile_border3": "fragile/border_3",
		"fragile_topLeftLQGemColor": "fragile/top_left_lq_gem_color",
		"fragile_topLeftLQGemOutline": "fragile/top_left_lq_gem_outline",
		"fragile_topLeftLQGemOutlineHighlight": "fragile/top_left_lq_gem_outline_highlight",
		"fragile_topLeftMidgroundDarken": "fragile/top_left_midground_darken",
		"fragile_topLeftMidgroundLighten": "fragile/top_left_midground_lighten",
		
		//active
		"fragileActive_checkerBottom1": "fragileactive/checker_bottom_1",
		"fragileActive_checkerBottom2": "fragileactive/checker_bottom_2",
		"fragileActive_checkerTop1": "fragileactive/checker_top_1",
		"fragileActive_checkerTop2": "fragileactive/checker_top_2",
		"fragileActive_highscoreBottom1": "fragileactive/highscore_bottom_1",
		"fragileActive_highscoreBottom2": "fragileactive/highscore_bottom_2",
		"fragileActive_highscoreBottom3": "fragileactive/highscore_bottom_3",
		"fragileActive_highscoreTop1": "fragileactive/highscore_top_1",
		"fragileActive_highscoreTop1Outline": "fragileactive/highscore_top_1_outline",
		"fragileActive_highscoreTop2": "fragileactive/highscore_top_2",
		//"fragileActive_highscoreTop3": "fragileactive/highscore_top_3"
}

var ImageAssets = {
	
}

var loader = document.querySelector('#loader');
var page = document.querySelector('#page');
var container = document.querySelector('#container');
var loaderBarFill = document.querySelector('#loaderBarFill');

//Object.keys(ImageSources).forEach((e)=>{
	/*var img = new Image();
	var src = ImageSources[e];
	img.src = 'assets/'+src+'.png';
	ImageAssets[e] = img;*/
	
	/*var img = document.createElement('img');
	var src = ImageSources[e];
	img.src = 'assets/'+src+'.png';
	document.querySelector('#hidden').appendChild(img);
	ImageAssets[e] = img;*/
	
	/*function loadInOrder() {
		let i = 0;
		const numImages = Object.keys(ImageSources).length;

		function loadImage() {
			var e = Object.keys(ImageSources)[i];
			const img = document.createElement('img');
			var src = ImageSources[e];
			img.src = 'assets/'+src+'.png';
			function next() {
				loaderBarFill.style.width = (((i+1)/numImages)*100)+'%';
				ImageAssets[e] = img;
				document.querySelector('#hidden').appendChild(img);
				i++;
				if (i < numImages) {
					loadImage();
				} else {
					loader.classList.add('hide');
					page.classList.add('show');
					SpriteMaker.Initialize();
				}
			}
			img.addEventListener('load', next);
			img.addEventListener('error', next);
		}

		loadImage();
	}
	loadInOrder();*/
function loadAll() {
  let numLoaded = 0;
  const numImages = Object.keys(ImageSources).length;

  function updateLoader() {
    const percentLoaded = ((numLoaded / numImages) * 100);
    loaderBarFill.style.width = percentLoaded + '%';
	if (percentLoaded == 100) {
		var ontitle = false;
		var title = document.title;
		var interval = setInterval((e)=>{
			if (ontitle) {
				document.title = '[ Loading Finished ]';
				ontitle = !ontitle;
			} else {
				document.title = title;
				ontitle = !ontitle;
			}
			
			if (document.visibilityState == 'visible') {
				document.title = title;
				clearInterval(interval);
			}
		}, 100);
	}
  }

  for (const e in ImageSources) {
    const img = document.createElement('img');
    const src = ImageSources[e];
    img.src = 'assets/' + src + '.png';
    img.addEventListener('load', () => {
      numLoaded++;
      updateLoader();
      ImageAssets[e] = img;
      document.querySelector('#hidden').appendChild(img);
      if (numLoaded === numImages) {
        loader.classList.add('hide');
        page.classList.add('show');
        SpriteMaker.Initialize();
      }
    });
    img.addEventListener('error', () => {
      numLoaded++;
      updateLoader();
      if (numLoaded === numImages) {
        loader.classList.add('hide');
        page.classList.add('show');
        SpriteMaker.Initialize();
      }
    });
  }
}
loadAll();

//});

Array.prototype.add = function(arr2) {
  var arr1 = this;
  const combined = {};
  // Combine keys and values recursively
  function combine(obj1, obj2) {
    for (let key in obj2) {
      if (obj1.hasOwnProperty(key)) {
        if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
          obj1[key] = obj1[key].concat(obj2[key]);
        } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          combine(obj1[key], obj2[key]);
        } else {
          obj1[key] = obj2[key];
        }
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  combine(combined, arr1[0]);
  combine(combined, arr2[0]);
  return [combined];
}

class Spritesheet {
	#Data = {};
	Name = "";
	Type = 0;
	Features = [];
	HasBeenChanged = false;
	FirstChangeCall = ()=>{};
	
	constructor(Data) {
		this.SetData(Data);
	}
	
	SetData(Data) {
		this.HasBeenChanged = false;
		if (Data == undefined || Data == null) {
			return;
		}
		
		this.Data = Data.copy();
		this.Name = Data.name;
		this.Type = Data.type;
		this.Features = Data.features.copy();
		
		cachedSpriteData[Data.type] = Data;
		
		var isDef = false;
		spriteTemplates.copy().forEach((e)=>{
			if (e.features == this.Features) {
				isDef = true;
			} else {
				//spriteTemplates[this.Type].concat
			}
		})
		
		if (!isDef) {
			//this.Save();
		}
	}
	
	get string() {
		this.Data.name = this.Name;
		this.Data.features = this.Features;
		return JSON.stringify(this.Data);
	}
	
	Save() {
		localStorage.setItem('lastSpritesheet', this.string);
	}

	SetProperty(name, property, value) {
		if (!this.HasBeenChanged) {
			this.FirstChangeCall();
		}
		this.HasBeenChanged = true;
		try {
			const feature = this.Features.find(f => f.name === name);
			if (feature) {
				feature.properties[property] = value;
			} else {
				var newFeature = {
					name: name,
					properties: {
						[property]: value,
					}
				};
				this.Features.push(newFeature);
			}
			this.Save();
			return true;
		} catch {
			return false;
		}
	}

	RemoveProperty(name) { //incomplete
		try {
			const feature = this.Features.find(f => f.name === name);
			if (feature) {
				feature[property] = value;
			} else {
				const newFeature = {
					name: name,
					[property]: value,
				};
				this.Features.push(newFeature);
			}
			this.Save();
			return true;
		} catch {
			return false;
		}
	}

	GetProperty(featureName, propertyName) {
		const feature = this.Features.find(f => f.name.toLowerCase() == featureName.toLowerCase());
		if (feature == undefined) {
			/*//try {
				return spriteTemplates[this.Type].features.find(f => f.name.toLowerCase() == featureName.toLowerCase())[propertyName];
			//} catch {}*/
			return false;
		}
		var ret = spriteTemplates[this.Type].copy().features.find(f => f.name.toLowerCase() == featureName.toLowerCase());
		if (feature.properties[propertyName] == undefined) {
			//console.log('get new');
			//console.log(ret);
			if (propertyName == 'all') {
				return ret.properties;
			} else {
				ret = ret.properties[propertyName];
			}
			if (ret != undefined) {
				console.log('updated', ret, [featureName, propertyName]);
				return ret;
			}
		}
		var result = feature.properties[propertyName];
		if (ret != undefined) {
			var reta = ret.properties[propertyName];
			if (result.length < reta.length) {
				result += reta.slice(result.length);
			}
		}
		return propertyName=='all'?feature.properties:result;
	}

	SetValue(name, property, value) {
		if (!this.HasBeenChanged) {
			this.FirstChangeCall();
		}
		this.HasBeenChanged = true;
		try {
			const feature = this.Features.find(f => f.name === name);
			if (feature) {
				feature.values[property] = value;
			} else {
				var newFeature = {
					name: name,
					values: {
						[property]: value,
					}
				};
				this.Features.push(newFeature);
			}
			this.Save();
			return true;
		} catch {
			return false;
		}
	}

	GetValue(featureName, valueName) {
		const feature = this.Features.find(f => f.name.toLowerCase() == featureName.toLowerCase());
		try {
			if (feature.values || feature.values[valueName]) {
				//none
			} else {
				return {};
			}
		} catch {
			return {};
		}
		if (feature.values[valueName] == undefined) {
			var ret = spriteTemplates[this.Type].copy().features.find(f => f.name.toLowerCase() == featureName.toLowerCase());
			if (valueName == 'all') {
				return ret.values;
			} else {
				ret = ret.values[valueName];
			}
			if (ret != undefined) {
				console.log('updated', ret, [featureName, valueName]);
				return ret;
			}
		}
		return valueName=='all'?feature.values:feature.values[valueName];//add feature to take it from template if doesnt exist in data
	}
}

class VariableCache {
	CacheItems = {};
	MaxItems = 10;
	
	constructor(MaxItems = 10) {
		this.MaxItems = MaxItems;
	}

	Add(key, item) {
		this.CacheItems[key] = item;
		const keys = Object.keys(this.CacheItems);
		const numKeys = keys.length;
		if (numKeys > this.MaxItems) {
			for (let i = 0; i < numKeys - this.MaxItems; i++) {
				delete this.CacheItems[keys[i]];
			}
		}
	}

	Get(key) {
		return this.CacheItems[key];
	}

	Clear() {
		this.CacheItems = {};
	}
}


function updateSpriteOptions(name) {
	/*try {
	sprite.SetValue(name, 'Type', parseInt(inputs[name]['Type'].value));
	} catch {}*/
	var sk = Object.keys(inputs[name]);
	sk.forEach((e)=>{
		//console.log(name, e, inputs[name][e].value);
		sprite.SetProperty(name, e, inputs[name][e].value); //getting the value of the inputs is the problem that causes missing parts of the image
		sprite.SetValue(name, e, parseInt(inputs[name][e].value));
		//console.log('a', inputs[name][e].value);
	});
	renderSprite();
}

var currentDrawTimeoutAlt;
var currentDrawTimeout;

function renderSprite() {
	try {
		clearTimeout(currentDrawTimeoutAlt);
		clearTimeout(currentDrawTimeout);
	} catch {}
	
	currentDrawTimeoutAlt = setTimeout((e)=>{
		SpriteMaker.Data.Draw(sprite, document.querySelector('#alt'));
	}, 0);
	currentDrawTimeout = setTimeout((e)=>{
		SpriteMaker.Data.Draw(sprite, document.querySelector('#main'));
	}, 5);
}
function makeUI(name) {
	//console.log(name);
	closeUI();
	var nameProcessed = name.replaceAll('_', ' ');
	var html = ['<form onchange="updateSpriteOptions(\''+name+'\')"><span class="heading">'+nameProcessed+'</span>'];
	
	/*try {
		if (typeof(sprite.GetValue(name, 'Type')) == typeof(0)) {
			html.push('<label for="Type">Type<input type="number" id="Type" value="'+sprite.GetValue(name, 'Type')+'"/></label>');
		}
	//} catch {}*/

	var key1 = [];
	if (sprite.GetValue(name, 'all') != false) {
		//console.log(name);
		//console.log(sprite.GetValue(name, 'all'));
		key1 = Object.keys(sprite.GetValue(name, 'all'));
		//console.log(key1);
		key1.forEach((e)=>{
			var a = sprite.GetValue(name, e);
			//console.log('a', a);
			if (!isNaN(a) && a != undefined && a != null) {
				var options = [];
				var obj = spriteValues[sprite.Type]
				if (obj != undefined) {
					obj = obj.find(f => f.name === name);
				}
				if (obj == undefined) {
					console.log('spriteValues does not contain', name);
					options.push('<option selected value="0">Default</option>')
				} else {
					obj.values[e].forEach((val, index)=>{
						options.push('<option '+(index==a?'selected ':'')+'value="'+index+'">'+val+'</option>');
					});
				}
				//html.push('<label for="'+e+'">'+e.replaceAll('_', ' ')+'<input type="number" inputmode="numeric" placeholder="'+a+'" min="0" id="'+e+'" value="'+a+'"/></label>');
				html.push('<label for="'+e+'">'+e.replaceAll('_', ' ')+'<select id="'+e+'" value="'+a+'"/>'+options.join('')+'</select></label>');
			}
		});
	}
	var key = Object.keys(sprite.GetProperty(name, 'all'));
	key.forEach((e)=>{
		var a = sprite.GetProperty(name, e);
		var b = parseInt(a)
		if (a != undefined && a != null && isNaN(b)) {
			html.push('<label for="'+e+'">'+e.replaceAll('_', ' ')+'<input data-jscolor="{}" placeholder="'+a+'" id="'+e+'" value="'+a+'"/></label>');
		}
	});
	html.push('</form>');
	var div = document.createElement('div');
	div.id = 'mainform';
	div.innerHTML = html.join('');
	window.inputs = {};
	inputs[name] = {};
	key.forEach((e)=>{
		inputs[name][e] = div.querySelector('#'+e);
	});
	key1.forEach((e)=>{
		inputs[name][e] = div.querySelector('#'+e);
	});
	//inputs[name]['Type'] = div.querySelector('#type');
	container.appendChild(div);
	JSColor.install();
}
function closeUI() {
	if (document.querySelector('#mainform')) {
		document.querySelector('#mainform').remove();
	}
}
/*function AssignHitbox(width, height, left, top, highlightColor, onClickFunction) {
  canvas.addEventListener("click", handleClick, { capture: true });

  function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= left && x <= left + width && y >= top && y <= top + height) {
      highlightHitbox();
      onClickFunction();
      event.stopPropagation();
    }
  }

  function highlightHitbox() {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = highlightColor;
    ctx.fillRect(left, top, width, height);
  }
}*/

function AssignHitbox(left, top, width, height, name) {
  if (typeof(left) == typeof([1])) {
	  var array = left;
	  left = array[0];
	  top = array[1];
	  width = array[2];
	  height = array[3];
	  name = array[4];
  }
  
  // Create a new hitbox div element
  var hitbox = document.createElement("div");
  hitbox.style.width = width + "px";
  hitbox.style.height = height + "px";
  hitbox.style.left = left + "px";
  hitbox.style.top = top + "px";
  //hitbox.style.opacity = "0";
  hitbox.className = 'hitbox-'+name;

  function display(event) {
	event.stopPropagation();
	// Set all other hitboxes to opacity 0
	var hitboxes = document.querySelectorAll(".hitbox");
	for (var i = 0; i < hitboxes.length; i++) {
	  if (hitboxes[i] !== hitbox) {
		hitboxes[i].style.removeProperty('opacity');
	  }
	}
	if (hitbox.style.opacity == '') {
		// Highlight the hitbox and run the click handler
		hitbox.style.opacity = "1";
		makeUI(name);
	} else {
		hitbox.style.removeProperty('opacity');
		closeUI();
	}
  }
  
  function hide(event) {
    // Unhighlight the hitbox
    hitbox.style.opacity = "0";
	closeUI();
  }

  // Add click event listener to the hitbox
  hitbox.addEventListener("click", display);

  // Add touch event listener to the hitbox for mobile devices
  hitbox.addEventListener("touchstart", display);

  // Add click event listener to the document to unhighlight the hitbox
  canvas.parentElement.addEventListener("click", hide);

  // Add touch event listener to the document to unhighlight the hitbox for mobile devices
  canvas.parentElement.addEventListener("touchstart", hide);

  // Add the hitbox to the canvas element
  hitbox.classList.add("hitbox");
  canvas.parentElement.appendChild(hitbox);
}

function AssignHitboxes(hitboxes) {
	document.querySelectorAll('.hitbox').forEach(e => e.remove());
	hitboxes.forEach((e)=>{AssignHitbox(e)})
}

/*Array.prototype.copy = function() {
	return this.slice();
};
Object.prototype.copy = function() {
	return Object.assign({}, this);
};*/
function copy(obj, copied = new Set()) {
  if (typeof obj !== 'object' || obj === null) {
    // Return the input if it is not an object
    return obj;
  }

  // If the object has already been copied, return the existing copy
  if (copied.has(obj)) {
    return obj;
  }

  // Create a new object or array to copy the values into
  const copyObj = Array.isArray(obj) ? [] : {};

  // Add the object to the set of copied objects
  copied.add(obj);

  // Recursively copy each property or element
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copyObj[key] = copy(obj[key], copied);
    }
  }

  return copyObj;
}

// Add the copy() function to the prototypes of Object and Array
Object.defineProperty(Object.prototype, 'copy', {
  value: function() {
    return copy(this);
  },
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'copy', {
  value: function() {
    return copy(this);
  },
  writable: true,
  configurable: true
});

const spriteValues = Object.freeze([
	// ENEMY
	[
		{
			"name": "Laser_Beam",
			"values": {
				"Mode": ['Single', 'Double', 'Quadruple']
			},	
		},
		{
			"name": "Top_Right",
			"values": {
				"Type": ['Star', 'Pallet'],
				"Background_Type": ['Solid', 'Pallet'],
				"Gradient": ['Off', 'On'],
				"Mini_Jump": ['Off', 'On'],
				"Flip_Tile": ['None', 'Hourglass', 'Checkerboard', 'Flower', 'Diamond', 'Triple Square', 'U Shape', 'Boxed Star', 'Quad Circle'],
				"Powerups": ['Off', 'On']
			},	
		},
		{
			"name": "Main_Stripe",
			"values": {
				"Type": ['None', 'Default', 'Split', 'Wide']
			},	
		},
		{
			"name": "Alternate_Stripe",
			"values": {
				"Type": ['None', 'Default', 'Split', 'Wide']
			},	
		},
		{
			"name": "Light_Color_Pallet",
			"values": {
				"Type": ['Default']
			},	
		},
		{
			"name": "Dark_Color_Pallet",
			"values": {
				"Type": ['Default']
			},	
		},
		{
			"name": "Gradient",
			"values": {
				"Type": ['Classic', 'Modern']
			},	
		},
		{
			"name": "Riser_Top",
			"values": {
				"Type": ['Classic', 'Modern']
			},	
		},
	],
	// GENERAL
	[
		{
			"name": "Top_Left",
			"values": {
				"Type": ['General', 'Mover/MoverAuto'],
				"Inactive_Jump_Pad_Style": ['Default', 'Cut Edge', 'Net', 'Double Square', 'Chinese', 'Checkerboard'],
				"Active_Jump_Pad_Style": ['Default', 'Cut Edge', 'Net', 'Double Square', 'Chinese', 'Checkerboard']
			},	
		},
		{
			"name": "General",
			"values": {
				"Border_Style": ['Default', 'Cut Edge', 'Thin', 'Glow', 'Spread'],
				"Decoration_Type": ['None', 'Heat', 'Border'],
			},	
		},
	],
	// FRAGILE
	[
		{
			"name": "Top_Left",
			"values": {
				"Type": ['Fragile', 'FragileActive'],
				"Highscore_Style": ['Classic', 'Modern (Boxes)', 'Modern (Text Only)']
			},	
		},
		{
			"name": "Fragile",
			"values": {
				"Border_Style": ['Default', 'Wide', 'Thin', 'Basic Stripes', 'Boxes', 'Jade Rabbit'],
				"Decoration_Type": ['None', 'Pixels', 'Snowflakes'],
			},	
		},
	]
]);


const spriteTemplates = Object.freeze([
{
	"name": "Enemy1",
	"type": 0,
	"features": [
		{
			"name": "Laser_Center",
			"properties": {
				"Laser_Color": "#5affff",
				"Laser_Center": "#FFFFFF"
			}
		},
		{
			"name": "Laser_Beam",
			"values": {
				"Mode": 0
			},
			"properties": {
				"Laser_Color_1": "#5affffff",
				"Laser_Center_1": "#ffffffff",
				"Laser_Color_2": "#5AFFFFCA",
				"Laser_Center_2": "#FFFFFFCA",
				"Laser_Color_3": "#F86476ff",
				"Laser_Center_3": "#ffffffff",
				"Laser_Color_4": "#F86476D9",
				"Laser_Center_4": "#FFFFFFD9",
			}
		},
		{
			"name": "Top_Right",
			"values": {
				"Type": 0,
				"Background_Type": 1,
				"Gradient": 1,
				"Mini_Jump": 1,
				"Flip_Tile": 1,
				"Powerups": 1
			},
			"properties": {
				"Background": "#989089",
				"Star_Inactive_Color": "#3abcba",
				"Star_Active_Color": "#30efee",
				"Star_Inactive_Shadow_Color": "#000000",
				"Star_Active_Shadow_Color": "#000000",
				"Pallet_Gradient": "#ffffffff",
				"Inactive_Mini_Jump_Top": "#fcc993",
				"Inactive_Mini_Jump_Side": "#f1fffa",
				"Active_Mini_Jump_Top": "#f59e62",
				"Active_Mini_Jump_Side": "#b0564f",
				"Inactive_Flip_Tile_Background": "#727f7d",
				"Inactive_Flip_Tile_Color_1": "#8fb5b1ff",
				"Inactive_Flip_Tile_Color_2": "#8fb5b17d",
				"Active_Flip_Tile_Background": "#ecc75c",
				"Active_Flip_Tile_Color_1": "#fffb96ff",
				"Active_Flip_Tile_Color_2": "#fffb967d",
				"Powerup_Custom_Gradient": "#ffffff"
			}
		},
		{
			"name": "Main_Stripe",
			"values": {
				"Type": 1
			},
			"properties": {
				"Background": "#afa69d",
				"Color": "#30efee",
				"Shadow": "#000000"
			}
		},
		{
			"name": "Alternate_Stripe",
			"values": {
				"Type": 0
			},
			"properties": {
				"Background": "#afa69d",
				"Color": "#30efee",
				"Shadow": "#000000"
			}
		},
		{
			"name": "Light_Color_Pallet",
			"values": {
				"Type": 0
			},
			"properties": {
				"Color_1_Border": "#1b8887",
				"Color_1_Background": "#24b4b3",
				"Color_2_Border": "#1d9392",
				"Color_2_Background": "#27c3c2",
				"Color_3_Border": "#209e9d",
				"Color_3_Background": "#2ad2d1",
				"Color_4_Border": "#21a4a3",
				"Color_4_Background": "#2cdad9",
				"Color_5_Border": "#07a9a7",
				"Color_5_Background": "#09e0de",
				"Color_6_Border": "#07a9a7",
				"Color_6_Background": "#09e0de"
			}
		},
		{
			"name": "Dark_Color_Pallet",
			"values": {
				"Type": 0
			},
			"properties": {
				"Color_1_Border": "#47423d",
				"Color_1_Background": "#5e5751",
				"Color_2_Border": "#47423d",
				"Color_2_Background": "#5e5751",
				"Color_3_Border": "#66605a",
				"Color_3_Background": "#877f77",
				"Color_4_Border": "#544f4b",
				"Color_4_Background": "#706963",
				"Color_5_Border": "#847d76",
				"Color_5_Background": "#afa69d",
				"Color_6_Border": "#625d58",
				"Color_6_Background": "#817a74"
			}
		},
		{
			"name": "Gradient",
			"values": {
				"Type": 0
			},
			"properties": {
				"Darken_Color": "#3f3936",
				"Lighten_Color": "#7f7872",
				"Border_Color": "#4d4642",
				"Strip_Lighten_Color": "#30efee",
				"Strip_Darken_Color": "#1de8e6"
			}
		},
		{
			"name": "Riser_Top",
			"values": {
				"Type": 0
			},
			"properties": {
				"Background": "#afa69d",
				"Left_Outer_Border": "#857d76",
				"Left_Inner_Border": "#857d76",
				"Left_Inner_Color": "#24b4b3",
				"Right_Outer_Border": "#857d76",
				"Right_Inner_Border": "#857d76",
				"Right_Inner_Color":"#30efee"
			}
		},
	]
},
{
	"name": "General1",
	"type": 1,
	"features": [
		{
			"name": "Top_Left",
			"values": {
				"Type": 0,
				"Active_Jump_Pad_Style": 0,
				"Inactive_Jump_Pad_Style": 0,
			},
			"properties": {
				"Active_Jump_Pad_Color": "#feab2c",
				"Active_Jump_Pad_Border": "#ffff00",
				"Active_Jump_Pad_Side": "#ffff00",
				"Active_Jump_Pad_Decoration_1": "#FFFF0090",
				"Active_Jump_Pad_Decoration_2": "#ffffff00",
				"Inactive_Jump_Pad_Color": "#fd873e",
				"Inactive_Jump_Pad_Border": "#eb7a38",
				"Inactive_Jump_Pad_Side": "#d67040",
				"Inactive_Jump_Pad_Decoration_1": "#eb7a3890",
				"Inactive_Jump_Pad_Decoration_2": "#ffffff00",
				"Active_Mover_Arrow_Color": "#feab2c",
				"Active_Mover_Arrow_Inner_Color": "#ffffff00",
				"Active_Mover_Arrow_Border": "#ffff00",
				"Active_Mover_Arrow_Side": "#ffff00",
				"Inactive_Mover_Arrow_Color": "#fd873e",
				"Inactive_Mover_Arrow_Inner_Color": "#ffffff00",
				"Inactive_Mover_Arrow_Border": "#eb7a38",
				"Inactive_Mover_Arrow_Side": "#eb7a38",
				"Mover_Border_Outline": "#db7032"
				
			}
		},
		{
			"name": "Pallet",
			"properties": {
				"Shadow": "#e69e4cff",
				"Square_1": "#e69f43ff",
				"Square_1_Overlay": "#dd9647ff",
				"Square_2": "#eaa442ff",
				"Square_2_Overlay": "#dd9647ff",
				"Square_3": "#c27f38ff",
				"Square_4": "#da9540ff",
				"Square_4_Overlay": "#d38e42ff",
				"Square_5": "#cb873dff"
			}
		},
		{
			"name": "General",
			"values": {
				"Border_Style": 0,
				"Decoration_Type": 0
			},
			"properties": {
				"Background": "#fdb643",
				"Border": "#e69e4c",
				"Lower_Border": "#E69E4C90",
				"Decoration_Color_1": "#ff9b3c88",
				"Decoration_Color_2": "#b76f227c"
			}
		}
	]
},
{
	"name": "Fragile1",
	"type": 2,
	"features": [
		{
			"name": "Top_Left",
			"values": {
				"Type": 0,
				"Highscore_Style": 2,
			},
			"properties": {
				"Low_Quality_Gem_Color": "#ff6044",
				"Low_Quality_Gem_Outline": "#FFFFFF22",
				"Low_Quality_Gem_Highlight": "#FF7751FF",
				"Midground_Gradient_Top": "#12d9e0",
				"Midground_Gradient_Bottom": "#20c7d1",
				/*"Midground_Gradient_Decoration": "#ffffff"*/
				"Top_Checker_1": "#fdb6447f",
				"Top_Checker_2": "#fd873e7f",
				"Bottom_Checker_1": "#fdb6447f",
				"Bottom_Checker_2": "#fd873e7f",
				"Top_Highscore_Color": "#FFFFFFC7",
				"Top_Highscore_Outline": "#FDB644B9",
				"Bottom_Highscore_Color": "#FFE500BD",
			}
		},
		{
			"name": "Pallet",
			"properties": {
				"Shadow": "#9fe0ffff",
				"Square_1": "#6697a9ff",
				"Square_1_Overlay": "#9fe0ff00",
				"Square_2": "#80c7d2cf",
				"Square_2_Overlay": "#9fe0ffff",
				"Square_3": "#90bcc5ff",
				"Square_4": "#8cd1e0df",
				"Square_4_Overlay": "#9fe0ffff",
				"Square_5": "#9fe0ffff"
			}
		},
		{
			"name": "Fragile",
			"values": {
				"Border_Style": 0,
				"Decoration_Type": 0
			},
			"properties": {
				"Background": "#72bcbfbf",
				"Stripes": "#ade5f0ff",
				"Border": "#9fe0ffff"
			}
		}
	]
}
]);

var cachedSpriteData = [
spriteTemplates[0].copy(),
spriteTemplates[1].copy(),
spriteTemplates[2].copy(),
];

var spritename = document.querySelector('#spritename');
var spriteType = document.querySelector('#spriteType');

window.onload = ()=>{
	//updateNameType();
}
function updateNameType() {
	sprite.Name = spritename.value;
	//sprite.Type = parseInt(spriteType.value);
	//sprite.SetData(cachedSpriteData[sprite.Type]);
	//document.querySelectorAll('.hitbox').forEach(e => e.remove());
	
	/*spritename.value = sprite.Name;
	spriteType.value = sprite.Type;
	
	SpriteMaker.Data.Draw(sprite, canvas);*/
}

function sprDownload(type) {
	switch (type) {
		case 0:
		var link = document.createElement('a');
		link.download = sprite.Name+'.png';
		link.href = canvas.toDataURL();
		link.click();
		break;
		case 1:
		var link = document.createElement('a');
		link.download = sprite.Name+'.rs';
		link.href = 'data:text/plain;charset=utf-8,'+LevelEncryptor.encrypt(sprite.string);
		link.click();
		break;
	}
}

// Get the file upload input element
const fileInput = document.getElementById('fileuploadinput');

// Add an event listener to the input element to listen for file selection
fileInput.addEventListener('change', (event) => {
	if (fileInput.files.length == 0) {
		return;
	}
	
	var fr=new FileReader();
	fr.onload=function(){
		// Decrypt the contents using LevelEncryptor.decrypt()
		const decryptedText = LevelEncryptor.decrypt(fr.result);
		
		if (decryptedText == '') {
			return;
		}
		
		// Parse the decrypted text as JSON
		const json = JSON.parse(decryptedText);
			// Execute sprite.SetData() with the JSON object
			sprite.SetData(json);
			MainMenu.Exit();
			sprite.Save();
	}
	  
	fr.readAsText(fileInput.files[0]);
});


var MainMenu = {
	object: document.querySelector('#mainmenu'),
	object1: document.querySelector('#container'),
	LoadTemplate(type) {
		sprite.SetData(spriteTemplates[type].copy());
		sprite.FirstChangeCall = Counter.add;
		spritename.value = sprite.Name;
		MainMenu.Exit();
	},
	LoadPrevious() {
		var a = localStorage.getItem('lastSpritesheet');
		if (a != undefined && a != null) {
			sprite.SetData(JSON.parse(a));
			spritename.value = sprite.Name;
			MainMenu.Exit();
		}
	},
	Exit() {
		renderSprite();
		spritename.value = sprite.Name;
		MainMenu.object.style.display = 'none';
		MainMenu.object1.style.display = 'block';
		document.body.scrollTo(0, 0);
		clearInterval(window.liveUpdateAmount);
	},
	Enter() {
		closeUI();
		MainMenu.object.style.display = 'block';
		MainMenu.object1.style.display = 'none';
		document.body.scrollTo(0, 0);
		function updateCount() {
			Counter.get().then((e)=>{spriteAmountMade.innerHTML = e});
		}
		updateCount();
		window.liveUpdateAmount = setInterval(()=>{
			updateCount();
		}, 1500);
		clearTimeout(window.liveUpdateTime);
	}
}

window.onbeforeunload = function() {
	return "Are you sure you want to reload the editor? Your progress on your spritesheet will only be saved if you have modified it.";
};

const Counter = {
	url: /*'https://blistered-strands.000webhostapp.com/spritemaker/spriteCounter.php'*/ '',

	async add() {
		/*const response = await fetch(Counter.url, {
			method: 'POST'
		});

		/*if (!response.ok) {
			throw new Error('Error incrementing counter');
		}*/
	},

	async get() {
		/*const response = await fetch(Counter.url, {
			method: 'GET'
		});

		/*if (!response.ok) {
			throw new Error('Error getting counter value');
		}*/

		/*const data = await response.json();
		return data.counter;*/
	}
}

function createNewSpritesheet(val) {
	MainMenu.LoadTemplate(val);
}

var spriteAmountMade = document.getElementById('spriteAmountMade');

var liveUpdateAmount = undefined;
var liveUpdateTime = undefined;

document.body.scrollTo(0, 0);

MainMenu.Enter();