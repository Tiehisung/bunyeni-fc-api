import { Request, Response,  } from "express";

// Public routes

export async function runUpdate(req: Request, res: Response) {
    try {
        // const update = await NewsModel.updateMany({}, {
        //     $set: {
        //         likes: [],
        //         comments: [],
        //         shares: [],
        //         views: [],
        //     }
        // })
        res.json({ update:[],   })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: (error.message || "Failed to update")
        });
    }
}


const n = [
    {
        "_id": "69c44be5321344eacc092314",
        "slug": "sallah-day-glory-bunyeni-fc-announce-themselves-in-style-with-5-2-away-triumph",
        "headline": {
            "text": "Sallah Day Glory: Bunyeni FC Announce Themselves in Style with 5–2 Away Triumph ",
            "image": "https://res.cloudinary.com/djzfztrig/image/upload/v1774470839/news/media-2026/zh4gt4appjv58lt56hgi.jpg"
        },
        "source": "bunyenifc.vercel.app",
        "details": [
            {
                "text": "<p>For many football lovers in Konjiehi, Sallah Day 2026 will be remembered for more than celebration—it will be remembered as the day Bunyeni FC took a bold step into a new chapter.</p><p><br></p><p>On March 21, 2026, under the spirit and joy of the festive season, Bunyeni FC traveled for their maiden away fixture to face Guonuo SC. What unfolded was not just a football match, but a statement of intent—powered not only by the players on the pitch, but by a community standing firmly behind them.</p>",
                "media": [
                    {
                        "id": "uw-file8",
                        "batchId": "uw-batch5",
                        "asset_id": "d71f07f8cf9c388ad94ecf02ff9835b1",
                        "public_id": "news/media-2026/zja58mux9c8jclccsdlw",
                        "version": 1774471020,
                        "version_id": "f90d4b7b7c402567e4ce13ecd4026d22",
                        "signature": "e4d96559d3eb848ce2e72badf9df2988bebebde8",
                        "width": 1280,
                        "height": 960,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:37:00Z",
                        "tags": [],
                        "bytes": 225457,
                        "type": "upload",
                        "etag": "d523fcaef42b88e2dc9ea0a96dfba16a",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/zja58mux9c8jclccsdlw.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/zja58mux9c8jclccsdlw.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.07 PM",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.07 PM",
                        "original_extension": "jpeg",
                        "path": "v1774471020/news/media-2026/zja58mux9c8jclccsdlw.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471020/news/media-2026/zja58mux9c8jclccsdlw.jpg"
                    },
                    {
                        "id": "uw-file7",
                        "batchId": "uw-batch5",
                        "asset_id": "001025f112cc365ad2b5c82407d2e33a",
                        "public_id": "news/media-2026/b581tfrohuf5cblb85zo",
                        "version": 1774471020,
                        "version_id": "f90d4b7b7c402567e4ce13ecd4026d22",
                        "signature": "6a4c8851720a7cae5da8f958ed6861ac638811d0",
                        "width": 960,
                        "height": 1280,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:37:00Z",
                        "tags": [],
                        "bytes": 249944,
                        "type": "upload",
                        "etag": "e5aad004ce2276d016d71d98abc5c40e",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/b581tfrohuf5cblb85zo.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/b581tfrohuf5cblb85zo.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.07 PM (2)",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.07 PM (2)",
                        "original_extension": "jpeg",
                        "path": "v1774471020/news/media-2026/b581tfrohuf5cblb85zo.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471020/news/media-2026/b581tfrohuf5cblb85zo.jpg"
                    },
                    {
                        "id": "uw-file9",
                        "batchId": "uw-batch5",
                        "asset_id": "93edb186c41bbd8d8584e0236ad083f1",
                        "public_id": "news/media-2026/mipojnpwp7iee1ispqdu",
                        "version": 1774471020,
                        "version_id": "f90d4b7b7c402567e4ce13ecd4026d22",
                        "signature": "8d99b3de2ac780c5da668168ec64dbd480c5df66",
                        "width": 960,
                        "height": 1280,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:37:00Z",
                        "tags": [],
                        "bytes": 261613,
                        "type": "upload",
                        "etag": "21cea080da8d7eebefae40ac82f53383",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/mipojnpwp7iee1ispqdu.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471020/news/media-2026/mipojnpwp7iee1ispqdu.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.08 PM (1)",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.08 PM (1)",
                        "original_extension": "jpeg",
                        "path": "v1774471020/news/media-2026/mipojnpwp7iee1ispqdu.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471020/news/media-2026/mipojnpwp7iee1ispqdu.jpg"
                    },
                    {
                        "id": "uw-file6",
                        "batchId": "uw-batch5",
                        "asset_id": "06694513a8c216fb241a9df317b4f6f0",
                        "public_id": "news/media-2026/bykoqh9uvoldjhgq4qgp",
                        "version": 1774471017,
                        "version_id": "f34708a27b68c0fc55c4246c5cab4022",
                        "signature": "e8803a41bcfabb1635d91b49079442944e3c505b",
                        "width": 1280,
                        "height": 960,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:36:57Z",
                        "tags": [],
                        "bytes": 222230,
                        "type": "upload",
                        "etag": "cfa8748845ecb0c3bc23393ca59e34b5",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471017/news/media-2026/bykoqh9uvoldjhgq4qgp.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471017/news/media-2026/bykoqh9uvoldjhgq4qgp.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.07 PM (1)",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.07 PM (1)",
                        "original_extension": "jpeg",
                        "path": "v1774471017/news/media-2026/bykoqh9uvoldjhgq4qgp.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471017/news/media-2026/bykoqh9uvoldjhgq4qgp.jpg"
                    },
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "b3ad812dcd5aa37caabab9493f1dce8f",
                        "public_id": "news/media-2026/warz4bqqu9kcffafcxku",
                        "version": 1774470967,
                        "version_id": "76a4c001763d0e8bfd8eccdbdc5b5e8e",
                        "signature": "3ca0b562c4344d19590a874d99f0aee0cad55fc4",
                        "width": 480,
                        "height": 848,
                        "format": "mp4",
                        "resource_type": "video",
                        "created_at": "2026-03-25T20:36:07Z",
                        "tags": [],
                        "pages": 0,
                        "bytes": 1189188,
                        "type": "upload",
                        "etag": "f25d1e01b5b5d19f8821ed0f932c3487",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/video/upload/v1774470967/news/media-2026/warz4bqqu9kcffafcxku.mp4",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/video/upload/v1774470967/news/media-2026/warz4bqqu9kcffafcxku.mp4",
                        "playback_url": "https://res.cloudinary.com/djzfztrig/video/upload/sp_auto/v1774470967/news/media-2026/warz4bqqu9kcffafcxku.m3u8",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Video 2026-03-25 at 8.06.10 PM",
                        "audio": {
                            "codec": "aac",
                            "bit_rate": "63137",
                            "frequency": 44100,
                            "channels": 2,
                            "channel_layout": "stereo"
                        },
                        "video": {
                            "pix_format": "yuv420p",
                            "codec": "h264",
                            "level": 31,
                            "profile": "Baseline",
                            "bit_rate": "1265932",
                            "time_base": "1/600"
                        },
                        "is_audio": false,
                        "frame_rate": 30,
                        "bit_rate": 1321652,
                        "duration": 7.198186,
                        "rotation": 90,
                        "original_filename": "WhatsApp Video 2026-03-25 at 8.06.10 PM",
                        "nb_frames": 214,
                        "path": "v1774470967/news/media-2026/warz4bqqu9kcffafcxku.mp4",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/video/upload/c_limit,h_60,w_90/v1774470967/news/media-2026/warz4bqqu9kcffafcxku.jpg"
                    }
                ],
                "_id": "69c44be5321344eacc092315"
            },
            {
                "text": "<p>From the moment the team arrived, there was a quiet determination in the air. This was unfamiliar ground, a different crowd, and a true test of character. Yet, Bunyeni FC looked composed and ready.</p><p><br></p><p>The opening minutes were electric. Bunyeni FC pressed high, moved the ball with confidence, and showed flashes of attacking brilliance. Their efforts paid off early, as they broke the deadlock with a well-worked goal that stunned the home side and energized their traveling supporters.</p>",
                "media": [],
                "_id": "69c44be5321344eacc092316"
            },
            {
                "text": "<p>Guonuo SC responded with resilience, pulling one back to keep the contest alive. But Bunyeni FC remained focused. Through teamwork and discipline, they regained control and extended their lead before halftime, setting the tone for what was to come.</p><p><br></p><p>The second half saw Bunyeni FC grow in confidence. The midfield dictated play, the defense stood firm, and the attack proved clinical. Goal after goal, the team displayed hunger, unity, and belief—eventually sealing a remarkable 5–2 victory.</p>",
                "media": [],
                "_id": "69c44be5321344eacc092317"
            },
            {
                "text": "<p>Yet beyond the scoreline, this victory tells a deeper story—one of community.</p><p><br></p><p>This memorable outing was made possible by the generous support of individuals who stood behind the team. Notably, Dawono Abdul Wahid, a committed supporter, donated two packs of soft drinks to energize both players and fans. Antiku Abdul Waris also made a meaningful contribution, providing water and other refreshments that kept spirits high throughout the day.</p><p><br></p><p>In addition, Camp Miami City extended their support with a cash donation, further strengthening the team’s ability to undertake the trip successfully.</p><p>Several others also played vital roles, especially those who provided transportation to convey fans to the match venue—ensuring that Bunyeni FC did not feel alone on the road.</p><p><br></p><p>Special appreciation also goes to contributors such as Adam Nantiaha Hakeem and Maham Rufai, whose support added to the collective effort that made this journey possible.</p>",
                "media": [
                    {
                        "id": "uw-file4",
                        "batchId": "uw-batch2",
                        "asset_id": "398c25cb54a6feab5286acb66be76a1e",
                        "public_id": "news/media-2026/fyd0qczehjhb5wq1riuq",
                        "version": 1774471244,
                        "version_id": "d86c31c0de045c108cc5ee3fcf0ec940",
                        "signature": "141ea835babdc201d7ebd55a519d5f56fae5ea14",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:40:44Z",
                        "tags": [],
                        "bytes": 3213757,
                        "type": "upload",
                        "etag": "147188a756296c505b3a1e32fe4719de",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471244/news/media-2026/fyd0qczehjhb5wq1riuq.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471244/news/media-2026/fyd0qczehjhb5wq1riuq.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "IMG_20260321_153458_333",
                        "original_filename": "IMG_20260321_153458_333",
                        "path": "v1774471244/news/media-2026/fyd0qczehjhb5wq1riuq.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471244/news/media-2026/fyd0qczehjhb5wq1riuq.jpg"
                    },
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch2",
                        "asset_id": "bf8a4df0e208a59658e1b1539740b57c",
                        "public_id": "news/media-2026/glceeexbjpfu3ok5zudt",
                        "version": 1774471243,
                        "version_id": "a1de1d7a045d6cb72e84c3d1562dd1fc",
                        "signature": "a19439282b84c1beaafed8a599e29d69af58877b",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:40:43Z",
                        "tags": [],
                        "bytes": 3193866,
                        "type": "upload",
                        "etag": "1a116bca8458ff605bb64802902fb2db",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471243/news/media-2026/glceeexbjpfu3ok5zudt.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471243/news/media-2026/glceeexbjpfu3ok5zudt.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "IMG_20260321_153458_799",
                        "original_filename": "IMG_20260321_153458_799",
                        "path": "v1774471243/news/media-2026/glceeexbjpfu3ok5zudt.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471243/news/media-2026/glceeexbjpfu3ok5zudt.jpg"
                    },
                    {
                        "id": "uw-file6",
                        "batchId": "uw-batch2",
                        "asset_id": "092765f7e5d7e77b6c1097a52b45f1bb",
                        "public_id": "news/media-2026/fufbessinm4lnrqz9yfw",
                        "version": 1774471243,
                        "version_id": "a1de1d7a045d6cb72e84c3d1562dd1fc",
                        "signature": "35dd2af3937ada1286b72ab0cd52b0b9831af2b9",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:40:43Z",
                        "tags": [],
                        "bytes": 3219582,
                        "type": "upload",
                        "etag": "ee27163d4c863ef9410f05fe0100b388",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471243/news/media-2026/fufbessinm4lnrqz9yfw.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471243/news/media-2026/fufbessinm4lnrqz9yfw.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "IMG_20260321_153500_124",
                        "original_filename": "IMG_20260321_153500_124",
                        "path": "v1774471243/news/media-2026/fufbessinm4lnrqz9yfw.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471243/news/media-2026/fufbessinm4lnrqz9yfw.jpg"
                    },
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "592a2e80a89daf9cb27887ee4ff1ee92",
                        "public_id": "news/media-2026/bpdvhrygl7pjqpncih75",
                        "version": 1774471236,
                        "version_id": "f3dc491cb737b438c92b1895e9144513",
                        "signature": "3d2c9d41b315da11340d1332af13cdcc4ec61210",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:40:36Z",
                        "tags": [],
                        "bytes": 3183725,
                        "type": "upload",
                        "etag": "1c39c2fa17e1fed0739e7028bc514ce5",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471236/news/media-2026/bpdvhrygl7pjqpncih75.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471236/news/media-2026/bpdvhrygl7pjqpncih75.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "IMG_20260321_153457_976",
                        "original_filename": "IMG_20260321_153457_976",
                        "path": "v1774471236/news/media-2026/bpdvhrygl7pjqpncih75.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471236/news/media-2026/bpdvhrygl7pjqpncih75.jpg"
                    }
                ],
                "_id": "69c44be5321344eacc092318"
            },
            {
                "text": "<p>The unity between the team and its supporters was evident—not just in the cheers from the sidelines, but in the shared belief and commitment to a common dream.</p><p>Speaking after the match, members of the team expressed heartfelt gratitude:</p><p><em>“This victory is not just for us, but for everyone who supported us in any way. From refreshments to transport, every contribution mattered. We are truly grateful.”</em></p><p>Back in Konjiehi, news of the win spread quickly, bringing pride and excitement to the community. This was more than a football result—it was a moment of collective achievement.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "af414e5db4cd9fb955b607c69d10ba42",
                        "public_id": "news/media-2026/xsym4zzvgurg6d2pemnz",
                        "version": 1774471201,
                        "version_id": "d4ee5a10aff72d1adf8251f999c2a4e8",
                        "signature": "9c8c4520c51556fb5236381333c0aa07ea418ec4",
                        "width": 1872,
                        "height": 4160,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:40:01Z",
                        "tags": [],
                        "bytes": 3943899,
                        "type": "upload",
                        "etag": "b3592e17bdda48c5ac2554b0611b5269",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471201/news/media-2026/xsym4zzvgurg6d2pemnz.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471201/news/media-2026/xsym4zzvgurg6d2pemnz.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "IMG_20260321_172632_991",
                        "original_filename": "IMG_20260321_172632_991",
                        "path": "v1774471201/news/media-2026/xsym4zzvgurg6d2pemnz.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471201/news/media-2026/xsym4zzvgurg6d2pemnz.jpg"
                    }
                ],
                "_id": "69c44be5321344eacc092319"
            },
            {
                "text": "<p>Behind the scenes, the organization and execution of this historic outing were made possible through the dedication of the management and staff of Bunyeni FC. Leading the vision is CEO Nurul-Haque Yusif, whose commitment continues to drive the club forward. He is ably supported by Alhassan Ibrahim, serving as Secretary and Director, ensuring smooth coordination and administration.</p><p><br></p><p>On the technical side, Coach Yacoub, the Technical Manager, played a crucial role in preparing the team for this impressive performance. Supporting the operational structure is Adam Abdul Wahid, who serves as Utility Officer and Assistant Managing Director, contributing significantly to the team’s overall functionality.</p>",
                "media": [
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch2",
                        "asset_id": "fe2ba08e20fbc2654221c8a50fe38d44",
                        "public_id": "news/media-2026/bghfbptqhcqpxppxi3ay",
                        "version": 1774471664,
                        "version_id": "536a40b6eaa76b63b6c5deed4ba8f68d",
                        "signature": "3c96cb18c163b72a2a52af11c8067e860d5e4dc3",
                        "width": 960,
                        "height": 1280,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:47:44Z",
                        "tags": [],
                        "bytes": 211398,
                        "type": "upload",
                        "etag": "7477b89f088696d520a5114f71a4ab33",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471664/news/media-2026/bghfbptqhcqpxppxi3ay.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471664/news/media-2026/bghfbptqhcqpxppxi3ay.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.06 PM",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.06 PM",
                        "original_extension": "jpeg",
                        "path": "v1774471664/news/media-2026/bghfbptqhcqpxppxi3ay.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471664/news/media-2026/bghfbptqhcqpxppxi3ay.jpg"
                    },
                    {
                        "id": "uw-file4",
                        "batchId": "uw-batch2",
                        "asset_id": "0fb1817a940e746a64b78d0e327590f5",
                        "public_id": "news/media-2026/i8kx23f6i3aq92xcoc51",
                        "version": 1774471663,
                        "version_id": "ea76f95efba809972019342e26a6a1e7",
                        "signature": "f3e79a55de88ca1e7fe83558c980b42d1e8dd2a4",
                        "width": 1280,
                        "height": 960,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:47:43Z",
                        "tags": [],
                        "bytes": 214050,
                        "type": "upload",
                        "etag": "1ac12a137f3fe7c347e00c661e93d71a",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471663/news/media-2026/i8kx23f6i3aq92xcoc51.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471663/news/media-2026/i8kx23f6i3aq92xcoc51.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.06 PM (2)",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.06 PM (2)",
                        "original_extension": "jpeg",
                        "path": "v1774471663/news/media-2026/i8kx23f6i3aq92xcoc51.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471663/news/media-2026/i8kx23f6i3aq92xcoc51.jpg"
                    },
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "4a15e0c7bafd0e0aac5aa27a22bdcee5",
                        "public_id": "news/media-2026/fnugn8agpacqtn5p0blk",
                        "version": 1774471663,
                        "version_id": "ea76f95efba809972019342e26a6a1e7",
                        "signature": "92213a9ac95c5c2c699f4fdd19877eb60e8e5b6d",
                        "width": 960,
                        "height": 1280,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-03-25T20:47:43Z",
                        "tags": [],
                        "bytes": 216428,
                        "type": "upload",
                        "etag": "e2257d4529b11ae090d8b1a055d24898",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/djzfztrig/image/upload/v1774471663/news/media-2026/fnugn8agpacqtn5p0blk.jpg",
                        "secure_url": "https://res.cloudinary.com/djzfztrig/image/upload/v1774471663/news/media-2026/fnugn8agpacqtn5p0blk.jpg",
                        "asset_folder": "news/media-2026",
                        "display_name": "WhatsApp Image 2026-03-25 at 8.06.06 PM (1)",
                        "original_filename": "WhatsApp Image 2026-03-25 at 8.06.06 PM (1)",
                        "original_extension": "jpeg",
                        "path": "v1774471663/news/media-2026/fnugn8agpacqtn5p0blk.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/djzfztrig/image/upload/c_limit,h_60,w_90/v1774471663/news/media-2026/fnugn8agpacqtn5p0blk.jpg"
                    }
                ],
                "_id": "69c44be5321344eacc09231a"
            },
            {
                "text": "<p><strong>Match Summary</strong></p><p>Guonuo SC 2 – 5 Bunyeni FC</p><p>📅 March 21, 2026</p><p>      Sallah Day Fixture</p><p><br></p><p>As the celebrations fade and attention turns to the next challenge, one thing is certain—this historic away win will be remembered as the spark that lit the journey.</p><p><br></p><p>Bunyeni FC’s story is only just beginning.</p><p><br></p>",
                "media": [],
                "_id": "69c44be5321344eacc09231b"
            }
        ],
        "type": "general",
        "isPublished": true,
        "stats": {
            "viewCount": 35,
            "likeCount": 0,
            "shareCount": 0,
            "isTrending": false,
            "isLatest": true,
            "hasVideo": false
        },
        "status": "unpublished",
        "createdAt": "2026-03-25T20:56:05.034Z",
        "likes": [],
        "comments": [
            {
                "name": "I Soskode",
                "date": "2026-03-27T16:09:15.700Z",
                "comment": "<p>Hi nei</p>",
                "_id": "69c6abad48a00f8a7fbbfa02"
            }
        ],
        "shares": [],
        "views": [
            {
                "email": "isoskode@gmail.com",
                "name": "I Soskode",
                "date": "2026-03-25T21:06:22.487Z",
                "device": "6e5cd035-be32-4661-900a-c27767b3037b",
                "_id": "69c44e50321344eacc092346"
            },
            {
                "email": "isoskode@gmail.com",
                "name": "I Soskode",
                "date": "2026-03-27T16:08:25.986Z",
                "device": "3b2de61e-3d27-4c72-a514-739b861faf13",
                "_id": "69c6ab7b48a00f8a7fbbf9f0"
            },
            {
                "name": "I Soskode",
                "date": "2026-03-28T09:08:10.146Z",
                "device": "bffe836b-e843-4c70-91a8-29ec1f5225d1",
                "_id": "69c79a7a5542f62fd710f4ff"
            }
        ],
        "editors": [],
        "updatedAt": "2026-03-28T09:26:34.505Z",
        "__v": 1
    },
    {
        "_id": "6964f61a342257ab210d72ad",
        "slug": "konjiehifc-appoints-nuru-haqque-yussif-as-new-ceo",
        "headline": {
            "text": "KonjiehiFC Appoints Nuru-Haqque Yussif as New CEO",
            "image": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768224592/news/media-2026/78737195_2706169532739584_6322708290874638336_n_courxm.jpg"
        },
        "source": "konjiehifc.vercel.app",
        "details": [
            {
                "text": "<p>KonjiehiFC has entered a new era with the appointment of <a href=\"https://web.facebook.com/dan.yussif?__tn__=-UC*F\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(0, 102, 204);\">Nuru-Haqque Yussif</a> as the club’s Chief Executive Officer, bringing fresh energy, vision and strong support to the team.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "17a47d0d91e467bc70ca9e2fb58f5d2a",
                        "public_id": "news/media-2026/490928530_9761683080521492_1490838985068193179_n_hbmrfq",
                        "version": 1768222993,
                        "version_id": "7dcb20867d6b7989235aee3edfa9dc63",
                        "signature": "9818864e1c94ba687ac7e74a84938e4ceb8e109e",
                        "width": 1000,
                        "height": 1000,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T13:03:13Z",
                        "tags": [],
                        "bytes": 84708,
                        "type": "upload",
                        "etag": "a9c25b1be0875d6acb1d5028f8af8df4",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768222993/news/media-2026/490928530_9761683080521492_1490838985068193179_n_hbmrfq.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768222993/news/media-2026/490928530_9761683080521492_1490838985068193179_n_hbmrfq.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "490928530_9761683080521492_1490838985068193179_n",
                        "path": "v1768222993/news/media-2026/490928530_9761683080521492_1490838985068193179_n_hbmrfq.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768222993/news/media-2026/490928530_9761683080521492_1490838985068193179_n_hbmrfq.jpg"
                    }
                ],
                "_id": "69654ee57317706d4921c855"
            },
            {
                "text": "<p>Nuru-Haqque Yussif joins KonjiehiFC not only as a manager but also as a committed partner to the club’s future. As a potential sponsor, he has already shown deep belief in the team and its mission to grow grassroots football and represent the community with pride.</p>",
                "media": [],
                "_id": "69654ee57317706d4921c856"
            },
            {
                "text": "<p>Since taking charge in the last quarter of 2025, he has consistently supported the squad with <strong>match balls, kits, referee cards and whistles</strong>, ensuring that the team is properly equipped for games and training. He has also provided <strong>refreshment tokens after matches</strong>, a gesture that has boosted player morale and unity.</p>",
                "media": [
                    {
                        "id": "uw-file14",
                        "batchId": "uw-batch12",
                        "asset_id": "72e96306a02e26c4843050c09aa0d611",
                        "public_id": "news/media-2026/cones_IMG_20251121_193303_755_oj1gai",
                        "version": 1768223911,
                        "version_id": "6439c0f6ef10b90a506fbf5fe6b305c7",
                        "signature": "f735fda53ec9bf6432878bf3d4ef13fcbf6a85ad",
                        "width": 1799,
                        "height": 1670,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T13:18:31Z",
                        "tags": [],
                        "bytes": 424513,
                        "type": "upload",
                        "etag": "f4f03015a78ba78714b242b98b3cdf86",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768223911/news/media-2026/cones_IMG_20251121_193303_755_oj1gai.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768223911/news/media-2026/cones_IMG_20251121_193303_755_oj1gai.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "cones IMG_20251121_193303_755",
                        "path": "v1768223911/news/media-2026/cones_IMG_20251121_193303_755_oj1gai.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768223911/news/media-2026/cones_IMG_20251121_193303_755_oj1gai.jpg"
                    },
                    {
                        "id": "uw-file13",
                        "batchId": "uw-batch12",
                        "asset_id": "d84129759749ebeee622999fd647c2a9",
                        "public_id": "news/media-2026/cones_by_nurul_haq_IMG_20251121_193332_624_drjafz",
                        "version": 1768223911,
                        "version_id": "6439c0f6ef10b90a506fbf5fe6b305c7",
                        "signature": "a58d548dfff707b3816371e6833a474a151b40f6",
                        "width": 1872,
                        "height": 2245,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T13:18:31Z",
                        "tags": [],
                        "bytes": 636499,
                        "type": "upload",
                        "etag": "cb317f7c221ca49c1266edaf42109a50",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768223911/news/media-2026/cones_by_nurul_haq_IMG_20251121_193332_624_drjafz.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768223911/news/media-2026/cones_by_nurul_haq_IMG_20251121_193332_624_drjafz.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "cones by nurul haq IMG_20251121_193332_624",
                        "path": "v1768223911/news/media-2026/cones_by_nurul_haq_IMG_20251121_193332_624_drjafz.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768223911/news/media-2026/cones_by_nurul_haq_IMG_20251121_193332_624_drjafz.jpg"
                    }
                ],
                "_id": "69654ee57317706d4921c857"
            },
            {
                "text": "<p>Speaking on his mission for the club, Mr. Yussif emphasized the importance of professionalism and visibility.</p><p><br></p><p>“KonjiehiFC has great potential. My goal is to help organize the team and give it the recognition it deserves,” he said.</p><p><br></p><p>His leadership style focuses on structure, discipline and long-term growth, setting the foundation for a more competitive and respected KonjiehiFC.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "b3951234ebe123327a1e62259f8467f3",
                        "public_id": "news/media-2026/IMG_20260102_180800_889_oyt3ke",
                        "version": 1768224052,
                        "version_id": "bdfbdfefff3d133665fe2237df90a2cf",
                        "signature": "15f73399ae6df09a9bdb9b052aad29b653c54761",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T13:20:52Z",
                        "tags": [],
                        "bytes": 3352423,
                        "type": "upload",
                        "etag": "dd23f3052e9625c8935dfff3fbc7bac6",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768224052/news/media-2026/IMG_20260102_180800_889_oyt3ke.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768224052/news/media-2026/IMG_20260102_180800_889_oyt3ke.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180800_889",
                        "path": "v1768224052/news/media-2026/IMG_20260102_180800_889_oyt3ke.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768224052/news/media-2026/IMG_20260102_180800_889_oyt3ke.jpg"
                    },
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch4",
                        "asset_id": "eb49d5f7404bc69fb891a9194477b309",
                        "public_id": "news/media-2026/ceo_with_players_gwrbfc",
                        "version": 1768224183,
                        "version_id": "66d07ffd72ff3f2198b10e0b4ca417e8",
                        "signature": "1e6dc002e3ca9b5414a4a05360d29aed5989a6be",
                        "width": 1905,
                        "height": 861,
                        "format": "png",
                        "resource_type": "image",
                        "created_at": "2026-01-12T13:23:03Z",
                        "tags": [],
                        "bytes": 3000746,
                        "type": "upload",
                        "etag": "216e57d186f723e634941d411aa9e2e0",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768224183/news/media-2026/ceo_with_players_gwrbfc.png",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768224183/news/media-2026/ceo_with_players_gwrbfc.png",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "ceo with players",
                        "path": "v1768224183/news/media-2026/ceo_with_players_gwrbfc.png",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768224183/news/media-2026/ceo_with_players_gwrbfc.png"
                    }
                ],
                "_id": "69654ee57317706d4921c858"
            },
            {
                "text": "<p>The players, technical team and supporters have welcomed his arrival with excitement, confident that his dedication and support will help push KonjiehiFC to higher levels.</p><p>As KonjiehiFC continues its journey, the appointment of Nuru-Haqque Yussif marks a promising step toward a stronger and more professional future.</p>",
                "media": [],
                "_id": "69654ee57317706d4921c859"
            },
            {
                "text": "<p>By: SOSKODE </p>",
                "media": [],
                "_id": "69654ee57317706d4921c85a"
            }
        ],
        "type": "general",
        "isPublished": true,
        "stats": {
            "isTrending": true,
            "isLatest": true,
            "viewCount": 4
        },
        "likes": [
            {
                "name": "unknown",
                "date": "2026-01-14T16:29:08.631Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "6967c4c238db0fd4b4dc46ba"
            }
        ],
        "comments": [],
        "shares": [
            {
                "name": "unknown",
                "date": "2026-01-14T16:31:21.849Z",
                "device": "unknown",
                "_id": "6967c4d938db0fd4b4dc46dd"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T16:32:25.143Z",
                "device": "unknown",
                "_id": "6967c51938db0fd4b4dc4720"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T16:51:04.025Z",
                "device": "unknown",
                "_id": "6967c9788c18b94d4df526a6"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-24T19:44:54.177Z",
                "device": "unknown",
                "_id": "69752136326decfae7ab7081"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-24T19:46:35.179Z",
                "device": "unknown",
                "_id": "6975219b326decfae7ab70d3"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-02-02T21:49:02.070Z",
                "device": "unknown",
                "_id": "69811bce785908f09cf743bf"
            }
        ],
        "views": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-12T13:25:34.422Z",
                "device": "c9cc7ea7-110a-459f-8669-8dcf661fe9d5",
                "_id": "6964f64f04cd9a9c07c8b12d"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T07:30:38.182Z",
                "device": "ce95f127-3f9b-4ad1-8c89-1c8a3e5f5786",
                "_id": "6967461f2bfe17096c50e801"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T16:29:06.712Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "6967c45338db0fd4b4dc4654"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T16:50:48.086Z",
                "device": "1b2ef7d2-395e-4bef-80bb-c4eaa462943b",
                "_id": "6967c96bc59f63a493c4cee2"
            },
            {
                "name": "unknown",
                "date": "2026-01-14T23:30:56.527Z",
                "device": "93283655-f01d-4406-8ad6-fecb61546263",
                "_id": "6968277828f7b5b900a23efe"
            },
            {
                "name": "unknown",
                "date": "2026-01-15T09:58:33.241Z",
                "device": "0f05a267-26dc-4381-ae21-959caedee2f6",
                "_id": "6968ba499d1e81ac02662c9a"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T19:53:21.241Z",
                "device": "e1a0dd62-cd8b-44f3-897e-bc308dbe8e1b",
                "_id": "6975233256e5819005ffc514"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T20:11:13.007Z",
                "device": "50caee18-1a79-46aa-b8ae-dd3f753bcbf1",
                "_id": "69752762387a3e54902f73dc"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T21:02:44.728Z",
                "device": "3be9fb8f-e21c-44d0-83d2-9ffc95103e92",
                "_id": "697533786f476b09b3808e5a"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T23:27:08.173Z",
                "device": "ef09396f-a7d1-4884-98d4-961006ae18f5",
                "_id": "6975554d45f8a725fd9d4fb1"
            },
            {
                "name": "unknown",
                "date": "2026-01-25T05:21:32.038Z",
                "device": "c5e12e97-4fa9-49cd-8ace-7f4d92f57dd7",
                "_id": "6975a85c09496ece5627fbb7"
            },
            {
                "name": "unknown",
                "date": "2026-01-25T07:16:55.413Z",
                "device": "34e6c378-156f-4c6c-aa7c-17f99956a36b",
                "_id": "6975c368a96de28c4a049e92"
            },
            {
                "name": "unknown",
                "date": "2026-02-01T09:39:30.324Z",
                "device": "0d896cee-ebdb-4301-ab4a-68355a62dc04",
                "_id": "697f1f535812313de4b0a4bc"
            }
        ],
        "createdAt": "2026-01-12T13:24:42.460Z",
        "updatedAt": "2026-03-27T14:36:10.855Z",
        "__v": 0
    },
    {
        "_id": "6964ed4b94e2e3288f50ca24",
        "slug": "wa-central-mp-donated-jerseys-and-football-to-konjiehifc-in-november-2025",
        "headline": {
            "text": "Wa Central MP Donated Jerseys and Football to KonjiehiFC in November 2025",
            "image": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768222400/news/media-2026/IMG_20251109_165912_040_nkqn4z.jpg"
        },
        "source": "konjiehifc.vercel.app",
        "details": [
            {
                "text": "<p>In November 2025, <a href=\"KonjiehiFC.vercel.app\" rel=\"noopener noreferrer\" target=\"_blank\">KonjiehiFC</a> received a significant show of support when the Honorable Member of Parliament for the Wa Central Constituency fulfilled a request made by the club for football equipment.</p>",
                "media": [
                    {
                        "id": "uw-file4",
                        "batchId": "uw-batch3",
                        "asset_id": "5ed28848c969d22185abc7178a37092e",
                        "public_id": "news/media-2026/IMG_20251109_165948_219_v67dt3",
                        "version": 1768221231,
                        "version_id": "dd119d0071ac42bc6f8ab358a626b87d",
                        "signature": "8b9dea14db8958104d7528907ee2f9fe6b485dcf",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:33:51Z",
                        "tags": [],
                        "bytes": 6811083,
                        "type": "upload",
                        "etag": "57350d5820f72b780ea2b50442bdf7f4",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221231/news/media-2026/IMG_20251109_165948_219_v67dt3.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221231/news/media-2026/IMG_20251109_165948_219_v67dt3.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_165948_219",
                        "path": "v1768221231/news/media-2026/IMG_20251109_165948_219_v67dt3.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221231/news/media-2026/IMG_20251109_165948_219_v67dt3.jpg"
                    },
                    {
                        "id": "uw-file7",
                        "batchId": "uw-batch6",
                        "asset_id": "0b67928ba7f959ae2bb4b81d3bc5b5d8",
                        "public_id": "news/media-2026/IMG_20251109_165912_040_uafito",
                        "version": 1768221363,
                        "version_id": "cace9d4c9d5ad0267f86dd529d00398e",
                        "signature": "737b86e6036f1ef7a240d55a95beab92a1837c81",
                        "width": 4064,
                        "height": 3432,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:36:03Z",
                        "tags": [],
                        "bytes": 6736738,
                        "type": "upload",
                        "etag": "af2d94a124d8983069d0f82feeecd404",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221363/news/media-2026/IMG_20251109_165912_040_uafito.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221363/news/media-2026/IMG_20251109_165912_040_uafito.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_165912_040",
                        "path": "v1768221363/news/media-2026/IMG_20251109_165912_040_uafito.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221363/news/media-2026/IMG_20251109_165912_040_uafito.jpg"
                    },
                    {
                        "id": "uw-file8",
                        "batchId": "uw-batch6",
                        "asset_id": "4b1fe8a0c3a93d12664e37de1581c645",
                        "public_id": "news/media-2026/IMG_20251108_175524_755_zdqpck",
                        "version": 1768221368,
                        "version_id": "146bf4927b93e116dc22b8e4bad18889",
                        "signature": "611fe8144d85ef61b61f35e64a3ff31bf525f656",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:36:08Z",
                        "tags": [],
                        "bytes": 2659270,
                        "type": "upload",
                        "etag": "004f638778e6db2766b0d653139c5981",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221368/news/media-2026/IMG_20251108_175524_755_zdqpck.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221368/news/media-2026/IMG_20251108_175524_755_zdqpck.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251108_175524_755",
                        "path": "v1768221368/news/media-2026/IMG_20251108_175524_755_zdqpck.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221368/news/media-2026/IMG_20251108_175524_755_zdqpck.jpg"
                    },
                    {
                        "id": "uw-file9",
                        "batchId": "uw-batch6",
                        "asset_id": "02e2962eae76875306b55b1c2fa1adb4",
                        "public_id": "news/media-2026/IMG_20251109_165858_884_acdsi2",
                        "version": 1768221370,
                        "version_id": "445444c1fc686621faec2cec27e2224b",
                        "signature": "0ed10a0794b93014d841c4d5fdee866c43f948d8",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:36:10Z",
                        "tags": [],
                        "bytes": 4433889,
                        "type": "upload",
                        "etag": "f016c6f09f1fec99f4167ce8672b6d2d",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221370/news/media-2026/IMG_20251109_165858_884_acdsi2.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221370/news/media-2026/IMG_20251109_165858_884_acdsi2.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_165858_884",
                        "path": "v1768221370/news/media-2026/IMG_20251109_165858_884_acdsi2.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221370/news/media-2026/IMG_20251109_165858_884_acdsi2.jpg"
                    }
                ],
                "_id": "6964ef5634cca5e0da8be730"
            },
            {
                "text": "<p>The donation included a full set of jerseys and a football and followed a formal request made at the MP’s office by the then leadership of KonjiehiFC. The gesture came at an important time as the club was working to strengthen its operations and improve conditions for players.</p>",
                "media": [],
                "_id": "6964ef5634cca5e0da8be731"
            },
            {
                "text": "<p>The request was led by <strong>Alhassan Ibrahim</strong>, the former Chief Executive Officer of KonjiehiFC and now a member of the club’s management staff, alongside <strong>Atiku Yusuf</strong>, a former coach of the club. Their initiative helped secure much-needed equipment for the team.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "0ccd13246c37f6473e1a154ec2c3e023",
                        "public_id": "news/media-2026/dp_riggry",
                        "version": 1768221441,
                        "version_id": "b439f360cbcc8bb27b517928dcd957a3",
                        "signature": "ce0054d3c19b0d839a2bd373a6455db7b14de5c7",
                        "width": 1498,
                        "height": 992,
                        "format": "png",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:37:21Z",
                        "tags": [],
                        "bytes": 2386672,
                        "type": "upload",
                        "etag": "f833d86afe78d67f751645f200742509",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221441/news/media-2026/dp_riggry.png",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221441/news/media-2026/dp_riggry.png",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "dp",
                        "path": "v1768221441/news/media-2026/dp_riggry.png",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221441/news/media-2026/dp_riggry.png"
                    },
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch4",
                        "asset_id": "5ab8f70bc9a769bad208ff2b9bc6bed3",
                        "public_id": "news/media-2026/137545906_100137145392583_7122780179211140230_n_waw6d7",
                        "version": 1768221753,
                        "version_id": "f51521a0272f73f5c8990529537e6843",
                        "signature": "55f043534de7600bccbfa08c942bfa04961eb150",
                        "width": 2048,
                        "height": 2048,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:42:33Z",
                        "tags": [],
                        "bytes": 496216,
                        "type": "upload",
                        "etag": "d4fa6fa911451104ec74b1742c6a178c",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221753/news/media-2026/137545906_100137145392583_7122780179211140230_n_waw6d7.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221753/news/media-2026/137545906_100137145392583_7122780179211140230_n_waw6d7.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "137545906_100137145392583_7122780179211140230_n",
                        "path": "v1768221753/news/media-2026/137545906_100137145392583_7122780179211140230_n_waw6d7.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221753/news/media-2026/137545906_100137145392583_7122780179211140230_n_waw6d7.jpg"
                    }
                ],
                "_id": "6964ef5634cca5e0da8be732"
            },
            {
                "text": "<p>Club officials praised the MP for responding positively and showing belief in local football development.</p>",
                "media": [],
                "_id": "6964ef5634cca5e0da8be733"
            },
            {
                "text": "<p>“This donation gave our players a sense of pride and motivation. It showed that KonjiehiFC and grassroots football in Wa matter,” a club representative said.</p>",
                "media": [],
                "_id": "6964ef5634cca5e0da8be734"
            },
            {
                "text": "<p>The jerseys and football were immediately put to use in training and matches, helping the team to maintain a professional image on and off the pitch.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "b09250693f144f1474b6720dfdb2baa0",
                        "public_id": "news/media-2026/IMG_20251109_170408_597_fcamcm",
                        "version": 1768221842,
                        "version_id": "1ff7f5e383f7e8b7b87477dd14753b1c",
                        "signature": "72084392135893c7f6ecf404c69132b405cc82a9",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:44:02Z",
                        "tags": [],
                        "bytes": 6093232,
                        "type": "upload",
                        "etag": "447994e8027bd912cf76af403469e45c",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221842/news/media-2026/IMG_20251109_170408_597_fcamcm.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221842/news/media-2026/IMG_20251109_170408_597_fcamcm.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170408_597",
                        "path": "v1768221842/news/media-2026/IMG_20251109_170408_597_fcamcm.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221842/news/media-2026/IMG_20251109_170408_597_fcamcm.jpg"
                    },
                    {
                        "id": "uw-file8",
                        "batchId": "uw-batch7",
                        "asset_id": "f027cbc874a2f95797a4924b5562a2a5",
                        "public_id": "news/media-2026/IMG_20251109_170346_829_lfrfwt",
                        "version": 1768221873,
                        "version_id": "9be86eb6ba9467184bb86d097ab19256",
                        "signature": "22f701e5d92dc29142c069471c9a4ce0d2eb6a41",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:44:33Z",
                        "tags": [],
                        "bytes": 5817036,
                        "type": "upload",
                        "etag": "446ab99456cb8aa15333df88583d9527",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221873/news/media-2026/IMG_20251109_170346_829_lfrfwt.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221873/news/media-2026/IMG_20251109_170346_829_lfrfwt.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170346_829",
                        "path": "v1768221873/news/media-2026/IMG_20251109_170346_829_lfrfwt.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221873/news/media-2026/IMG_20251109_170346_829_lfrfwt.jpg"
                    },
                    {
                        "id": "uw-file11",
                        "batchId": "uw-batch10",
                        "asset_id": "4baa6fcece3a4e858dcea82138c376f5",
                        "public_id": "news/media-2026/IMG_20251109_170508_765_p3jrdk",
                        "version": 1768221885,
                        "version_id": "c61700fed8b7c3ad02d3e7249046e19f",
                        "signature": "ac2e035f8d6aa5739f49e7947ab5ac4900bcc68d",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:44:45Z",
                        "tags": [],
                        "bytes": 3890670,
                        "type": "upload",
                        "etag": "b87266319cda980cb5b9e14b9e70eae6",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221885/news/media-2026/IMG_20251109_170508_765_p3jrdk.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221885/news/media-2026/IMG_20251109_170508_765_p3jrdk.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170508_765",
                        "path": "v1768221885/news/media-2026/IMG_20251109_170508_765_p3jrdk.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221885/news/media-2026/IMG_20251109_170508_765_p3jrdk.jpg"
                    },
                    {
                        "id": "uw-file13",
                        "batchId": "uw-batch10",
                        "asset_id": "8ea8290d5dc4bf34ece298ee112a375e",
                        "public_id": "news/media-2026/IMG_20251109_170413_636_dzp0lr",
                        "version": 1768221908,
                        "version_id": "4f983a62ed397b7d3826d203d35d36fe",
                        "signature": "4311bd01f82e63cc517f8d5cd779019c1294a917",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:45:08Z",
                        "tags": [],
                        "bytes": 6537315,
                        "type": "upload",
                        "etag": "fa942a1955956d0c4bfd833c963e9541",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221908/news/media-2026/IMG_20251109_170413_636_dzp0lr.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221908/news/media-2026/IMG_20251109_170413_636_dzp0lr.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170413_636",
                        "path": "v1768221908/news/media-2026/IMG_20251109_170413_636_dzp0lr.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221908/news/media-2026/IMG_20251109_170413_636_dzp0lr.jpg"
                    },
                    {
                        "id": "uw-file14",
                        "batchId": "uw-batch10",
                        "asset_id": "db7a829c657e9c52eaea58c319e38f33",
                        "public_id": "news/media-2026/IMG_20251109_170430_135_yckja8",
                        "version": 1768221911,
                        "version_id": "ce02f6acac198677fc3533e5df727a17",
                        "signature": "bde456eaa18afdfb57a0d2323d113f4c3ab82541",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:45:11Z",
                        "tags": [],
                        "bytes": 5664178,
                        "type": "upload",
                        "etag": "7168b65dbb260d200c15c6c7f6e0aac7",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221911/news/media-2026/IMG_20251109_170430_135_yckja8.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221911/news/media-2026/IMG_20251109_170430_135_yckja8.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170430_135",
                        "path": "v1768221911/news/media-2026/IMG_20251109_170430_135_yckja8.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221911/news/media-2026/IMG_20251109_170430_135_yckja8.jpg"
                    },
                    {
                        "id": "uw-file16",
                        "batchId": "uw-batch10",
                        "asset_id": "e476e8ab99644e6c149a47ae8bb5c59e",
                        "public_id": "news/media-2026/IMG_20251109_170455_293_lcwtju",
                        "version": 1768221922,
                        "version_id": "e0d75b8db2b4d6f8ac39ef014ecd330a",
                        "signature": "3368a748329806265211fc8a493fde65bc3fd8cc",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:45:22Z",
                        "tags": [],
                        "bytes": 5770452,
                        "type": "upload",
                        "etag": "651f6d4fa996367d3ad5340972f7916e",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221922/news/media-2026/IMG_20251109_170455_293_lcwtju.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221922/news/media-2026/IMG_20251109_170455_293_lcwtju.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170455_293",
                        "path": "v1768221922/news/media-2026/IMG_20251109_170455_293_lcwtju.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221922/news/media-2026/IMG_20251109_170455_293_lcwtju.jpg"
                    },
                    {
                        "id": "uw-file15",
                        "batchId": "uw-batch10",
                        "asset_id": "d3a4956b9a59d384b3ceb4c19516692f",
                        "public_id": "news/media-2026/IMG_20251109_170451_039_gri267",
                        "version": 1768221922,
                        "version_id": "e0d75b8db2b4d6f8ac39ef014ecd330a",
                        "signature": "571db4b292232be4c310007c4f711745d2aede9a",
                        "width": 3048,
                        "height": 4384,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-12T12:45:22Z",
                        "tags": [],
                        "bytes": 5980639,
                        "type": "upload",
                        "etag": "1d4e7db7e03a0125c19e8132025141a5",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221922/news/media-2026/IMG_20251109_170451_039_gri267.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1768221922/news/media-2026/IMG_20251109_170451_039_gri267.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20251109_170451_039",
                        "path": "v1768221922/news/media-2026/IMG_20251109_170451_039_gri267.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1768221922/news/media-2026/IMG_20251109_170451_039_gri267.jpg"
                    }
                ],
                "_id": "6964ef5634cca5e0da8be735"
            },
            {
                "text": "<p>KonjiehiFC continues to build on the support of its community and partners as it works toward long-term growth and success.</p><p><br></p><p><br></p><p><br></p><p><strong style=\"color: rgb(102, 185, 102);\">By: <em>Alhassan Ibrahim Soskode</em></strong></p>",
                "media": [],
                "_id": "6964ef5634cca5e0da8be736"
            }
        ],
        "type": "general",
        "isPublished": true,
        "stats": {
            "isTrending": true,
            "isLatest": true,
            "viewCount": 5
        },
        "likes": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-12T12:47:45.812Z",
                "device": "c9cc7ea7-110a-459f-8669-8dcf661fe9d5",
                "_id": "6964eda1d08e16778d50d23e"
            },
            {
                "name": "unknown",
                "date": "2026-01-29T19:00:05.373Z",
                "device": "88226458-3c81-4fb2-a830-983a0ba1ff35",
                "_id": "697bae958e3e660025679e1d"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-02-16T07:23:18.392Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "6992c5f14737cbf963601d46"
            }
        ],
        "comments": [
            {
                "name": "I Soskode",
                "date": "2026-03-26T05:16:44.605Z",
                "comment": "<p>Wonderful 😊. We thank Allah Almighty for His blessings.</p>",
                "_id": "69c4c13dcfeba1cb6a006c4f"
            }
        ],
        "shares": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-12T12:48:36.714Z",
                "device": "unknown",
                "_id": "6964eda6d08e16778d50d255"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-12T12:50:34.012Z",
                "device": "unknown",
                "_id": "6964ee1bd08e16778d50d26e"
            },
            {
                "name": "Aziza Ismail",
                "date": "2026-01-19T19:13:16.348Z",
                "device": "unknown",
                "_id": "696e824cbfe449bb7a498673"
            },
            {
                "name": "unknown",
                "date": "2026-01-29T17:15:32.545Z",
                "device": "unknown",
                "_id": "697b95b4810f72f2efbf07ce"
            },
            {
                "name": "unknown",
                "date": "2026-01-29T17:16:41.595Z",
                "device": "unknown",
                "_id": "697b95f9810f72f2efbf0818"
            },
            {
                "name": "unknown",
                "date": "2026-01-29T17:16:49.782Z",
                "device": "unknown",
                "_id": "697b9601810f72f2efbf0841"
            }
        ],
        "views": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-12T12:47:44.036Z",
                "device": "c9cc7ea7-110a-459f-8669-8dcf661fe9d5",
                "_id": "6964ed71605f64da0e4998e8"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T18:37:25.355Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "69653f654efeb03803775ab4"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T20:11:57.648Z",
                "device": "e1a0dd62-cd8b-44f3-897e-bc308dbe8e1b",
                "_id": "6975278e0b7284121e1e033f"
            },
            {
                "name": "unknown",
                "date": "2026-01-29T18:59:34.315Z",
                "device": "88226458-3c81-4fb2-a830-983a0ba1ff35",
                "_id": "697bae18ace7bf2154cec56f"
            },
            {
                "name": "Adams Wahid",
                "date": "2026-01-30T22:48:21.047Z",
                "device": "0c2e3358-79ec-43c2-8ec3-c8c307feec58",
                "_id": "697cc4a977adebe052260ce5"
            },
            {
                "name": "unknown",
                "date": "2026-03-06T09:03:56.812Z",
                "device": "961a6ae2-4e21-4010-8963-570812734d23",
                "_id": "69aa987df279627be5b40f62"
            },
            {
                "email": "isoskode@gmail.com",
                "name": "I Soskode",
                "date": "2026-03-26T05:15:33.979Z",
                "device": "87698cec-f1b6-493b-85fa-dc642e4734c2",
                "_id": "69c4c0f7f4aa3c54806316b4"
            }
        ],
        "createdAt": "2026-01-12T12:47:07.446Z",
        "updatedAt": "2026-03-26T05:16:46.676Z",
        "__v": 0
    },
    {
        "_id": "6958ee7a2a7077eaec028629",
        "slug": "clean-sheet-total-beat-konjiehifc-s-perfect-4-0-victory-sends-a-new-year-statement-2026-01-03-102458",
        "headline": {
            "text": "Clean Sheet, Total Beat. KonjiehiFC's Perfect 4-0 Victory Sends a New Year Statement.",
            "image": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435241/news/media-2026/kunbiahi_vrs_kfc_02-01-26_o0zt5q.jpg"
        },
        "source": "konjiehifc.vercel.app",
        "details": [
            {
                "text": "<p>Sometimes, football offers the perfect narrative. Just a week after a frustrating 1-1 draw on Boxing Day, KonjiehiFC authored a dazzling New Year’s resurrection, dismantling KunbiahiFC 4-0 in a return friendly that doubled as a masterclass in growth and firepower.</p>",
                "media": [],
                "_id": "6958ee7a2a7077eaec02862a"
            },
            {
                "text": "<p>The story of this emphatic turnaround, however, will be rightly dominated by one name: Alhaji. The forward, playing with a point to prove, was simply sublime, netting a brilliant brace that served as the heart of KonjiehiFC’s victory.</p>",
                "media": [],
                "_id": "6958ee7a2a7077eaec02862b"
            },
            {
                "text": "<p>The first match on December 26th had been a cagey, tactical affair under the holiday lights, ending all square. The rematch, initially slated for Kunbiahifc’s home on January 2nd, was unexpectedly rerouted back to Konjiehi due to pitch issues. What was meant to be an away test became a homecoming party, and KonjiehiFC’s players arrived with party favors in the form of goals.</p>",
                "media": [
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "bac2ee191ad4125ea5e1b049425d191a",
                        "public_id": "news/media-2026/IMG_20260102_180748_960_1644603306_yqewn0",
                        "version": 1767435606,
                        "version_id": "66ee90d94421cb05784196686ad0e632",
                        "signature": "00d6edafb5881823b200460632436b823adcac5c",
                        "width": 2912,
                        "height": 1310,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:20:06Z",
                        "tags": [],
                        "bytes": 947857,
                        "type": "upload",
                        "etag": "a4e267d6e85b74967e4f50fa88014369",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435606/news/media-2026/IMG_20260102_180748_960_1644603306_yqewn0.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435606/news/media-2026/IMG_20260102_180748_960_1644603306_yqewn0.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180748_960@1644603306",
                        "path": "v1767435606/news/media-2026/IMG_20260102_180748_960_1644603306_yqewn0.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435606/news/media-2026/IMG_20260102_180748_960_1644603306_yqewn0.jpg"
                    },
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch2",
                        "asset_id": "c5adf07e1943a1a54923e25fa5d9ca29",
                        "public_id": "news/media-2026/IMG_20260102_180800_889_1644603309_otluer",
                        "version": 1767435607,
                        "version_id": "f218a24be52c739d404c2c47f79ecedb",
                        "signature": "8c1e8b42fe58f1eae2a67985e64fd9c9abfec9a6",
                        "width": 2912,
                        "height": 1310,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:20:07Z",
                        "tags": [],
                        "bytes": 922699,
                        "type": "upload",
                        "etag": "f0dc4a219a3cc5bfbdef5365e77ea4b2",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435607/news/media-2026/IMG_20260102_180800_889_1644603309_otluer.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435607/news/media-2026/IMG_20260102_180800_889_1644603309_otluer.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180800_889@1644603309",
                        "path": "v1767435607/news/media-2026/IMG_20260102_180800_889_1644603309_otluer.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435607/news/media-2026/IMG_20260102_180800_889_1644603309_otluer.jpg"
                    },
                    {
                        "id": "uw-file4",
                        "batchId": "uw-batch2",
                        "asset_id": "533f57cad987e5528124263561ebf34a",
                        "public_id": "news/media-2026/IMG_20260102_180803_369_1644603331_mng1uk",
                        "version": 1767435607,
                        "version_id": "f218a24be52c739d404c2c47f79ecedb",
                        "signature": "c8e5875169e185ccfd5baad794e9600c6a49db81",
                        "width": 2912,
                        "height": 1310,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:20:07Z",
                        "tags": [],
                        "bytes": 949911,
                        "type": "upload",
                        "etag": "46ac7a84a18b2d53c44ab727ce56aff5",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435607/news/media-2026/IMG_20260102_180803_369_1644603331_mng1uk.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435607/news/media-2026/IMG_20260102_180803_369_1644603331_mng1uk.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180803_369@1644603331",
                        "path": "v1767435607/news/media-2026/IMG_20260102_180803_369_1644603331_mng1uk.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435607/news/media-2026/IMG_20260102_180803_369_1644603331_mng1uk.jpg"
                    },
                    {
                        "id": "uw-file8",
                        "batchId": "uw-batch6",
                        "asset_id": "9a98bab7c78643481b77e99b4c9d5554",
                        "public_id": "news/media-2026/IMG_20260102_162453_684_1644602531_xhuhdb",
                        "version": 1767435628,
                        "version_id": "9d78a966ca05614248a6c00e8a28469c",
                        "signature": "bae31c15dc199a85c2a9a5808aca5686a1c3b314",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:20:28Z",
                        "tags": [],
                        "bytes": 3210737,
                        "type": "upload",
                        "etag": "49df4cfb00e55916775d40c3f297383e",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435628/news/media-2026/IMG_20260102_162453_684_1644602531_xhuhdb.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435628/news/media-2026/IMG_20260102_162453_684_1644602531_xhuhdb.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162453_684@1644602531",
                        "path": "v1767435628/news/media-2026/IMG_20260102_162453_684_1644602531_xhuhdb.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435628/news/media-2026/IMG_20260102_162453_684_1644602531_xhuhdb.jpg"
                    },
                    {
                        "id": "uw-file7",
                        "batchId": "uw-batch6",
                        "asset_id": "2e7fb338f9465600755a40edf4279a94",
                        "public_id": "news/media-2026/IMG_20260102_162447_249_1644602530_dm7vju",
                        "version": 1767435628,
                        "version_id": "9d78a966ca05614248a6c00e8a28469c",
                        "signature": "53475f7b3c8023e69478ac0a0320f5aa3def4a42",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:20:28Z",
                        "tags": [],
                        "bytes": 3432448,
                        "type": "upload",
                        "etag": "2821d16dd344a4166d45474ee48c5fa3",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435628/news/media-2026/IMG_20260102_162447_249_1644602530_dm7vju.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435628/news/media-2026/IMG_20260102_162447_249_1644602530_dm7vju.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162447_249@1644602530",
                        "path": "v1767435628/news/media-2026/IMG_20260102_162447_249_1644602530_dm7vju.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435628/news/media-2026/IMG_20260102_162447_249_1644602530_dm7vju.jpg"
                    }
                ],
                "_id": "6958ee7a2a7077eaec02862c"
            },
            {
                "text": "<p>While the first half saw KonjiehiFC controlling proceedings, a familiar tension lingered. The breakthrough, when it came, was a collective sigh of relief. Just before the halftime whistle, Fatawu broke the deadlock, finishing a slick team move to send the hosts into the break with a deserved lead and, crucially, the confidence that had been missing a week prior.</p>",
                "media": [],
                "_id": "6958ee7a2a7077eaec02862d"
            },
            {
                "text": "<p>The second half, however, belonged to Alhaji. Emerging from the tunnel with renewed purpose, he announced his intentions early. Collecting the ball just outside the box, he shifted his weight, created a yard of space, and curled a beautiful, unstoppable effort into the far corner. It was a moment of individual brilliance that transformed momentum into sheer dominance.</p>",
                "media": [
                    {
                        "id": "uw-file8",
                        "batchId": "uw-batch2",
                        "asset_id": "906997d1c52e493e095724d11974c08c",
                        "public_id": "news/media-2026/IMG_20260102_162659_417_1644603209_auxs1c",
                        "version": 1767435782,
                        "version_id": "1f4e306690b9486b8d043c0f09fb1331",
                        "signature": "2e3795d502b4c55ed7a4cf79fd35e493fe55254b",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:02Z",
                        "tags": [],
                        "bytes": 3538417,
                        "type": "upload",
                        "etag": "1a2a7f8441ef428c999b0fafa8dc22fc",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435782/news/media-2026/IMG_20260102_162659_417_1644603209_auxs1c.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435782/news/media-2026/IMG_20260102_162659_417_1644603209_auxs1c.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162659_417@1644603209",
                        "path": "v1767435782/news/media-2026/IMG_20260102_162659_417_1644603209_auxs1c.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435782/news/media-2026/IMG_20260102_162659_417_1644603209_auxs1c.jpg"
                    },
                    {
                        "id": "uw-file7",
                        "batchId": "uw-batch2",
                        "asset_id": "13064a8b9067de3d7fb98a9f62957422",
                        "public_id": "news/media-2026/IMG_20260102_162657_519_1644603208_bxwp62",
                        "version": 1767435787,
                        "version_id": "252f27ac94a20d532aa805c947b8bfc8",
                        "signature": "32f8f25eb6c68975fe83f2cdcfb748a3c2d59930",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:07Z",
                        "tags": [],
                        "bytes": 3784177,
                        "type": "upload",
                        "etag": "0ff8883c38221da7079dd954252790bb",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435787/news/media-2026/IMG_20260102_162657_519_1644603208_bxwp62.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435787/news/media-2026/IMG_20260102_162657_519_1644603208_bxwp62.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162657_519@1644603208",
                        "path": "v1767435787/news/media-2026/IMG_20260102_162657_519_1644603208_bxwp62.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435787/news/media-2026/IMG_20260102_162657_519_1644603208_bxwp62.jpg"
                    },
                    {
                        "id": "uw-file6",
                        "batchId": "uw-batch2",
                        "asset_id": "448198f51c071d3ebd4a38c3978d05a3",
                        "public_id": "news/media-2026/IMG_20260102_180800_889_1644603309_pjzbwn",
                        "version": 1767435788,
                        "version_id": "130486cc74718e011e49bf9c6a14132c",
                        "signature": "dc7b22885a215a97034f6670dd53b56e15a62492",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:08Z",
                        "tags": [],
                        "bytes": 3358193,
                        "type": "upload",
                        "etag": "26274197828cbfdd18e8895d9ac11730",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435788/news/media-2026/IMG_20260102_180800_889_1644603309_pjzbwn.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435788/news/media-2026/IMG_20260102_180800_889_1644603309_pjzbwn.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180800_889@1644603309",
                        "path": "v1767435788/news/media-2026/IMG_20260102_180800_889_1644603309_pjzbwn.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435788/news/media-2026/IMG_20260102_180800_889_1644603309_pjzbwn.jpg"
                    },
                    {
                        "id": "uw-file3",
                        "batchId": "uw-batch2",
                        "asset_id": "e1f0f1b1993f21b297d45c14aa707fbe",
                        "public_id": "news/media-2026/IMG_20260102_162700_535_1644603210_euaqan",
                        "version": 1767435790,
                        "version_id": "42985e59fd9f50e8775ff252b6552a69",
                        "signature": "18b9c749de62053a2604e152dd5efb673c46ecca",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:10Z",
                        "tags": [],
                        "bytes": 3775985,
                        "type": "upload",
                        "etag": "1623c41141ce9ad5df45f392d88995e0",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435790/news/media-2026/IMG_20260102_162700_535_1644603210_euaqan.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435790/news/media-2026/IMG_20260102_162700_535_1644603210_euaqan.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162700_535@1644603210",
                        "path": "v1767435790/news/media-2026/IMG_20260102_162700_535_1644603210_euaqan.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435790/news/media-2026/IMG_20260102_162700_535_1644603210_euaqan.jpg"
                    },
                    {
                        "id": "uw-file5",
                        "batchId": "uw-batch2",
                        "asset_id": "273896dc06ca5805e1cfb2d846cb0600",
                        "public_id": "news/media-2026/IMG_20260102_180748_960_1644603306_ovcanc",
                        "version": 1767435795,
                        "version_id": "2de21127a4d301901492451ee2d63cb1",
                        "signature": "64a9c641d71cd43fedf3ec743f7f3e2ea3a6c06b",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:15Z",
                        "tags": [],
                        "bytes": 3464689,
                        "type": "upload",
                        "etag": "a1fb986cab906eed959bf0ed274a3795",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435795/news/media-2026/IMG_20260102_180748_960_1644603306_ovcanc.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435795/news/media-2026/IMG_20260102_180748_960_1644603306_ovcanc.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_180748_960@1644603306",
                        "path": "v1767435795/news/media-2026/IMG_20260102_180748_960_1644603306_ovcanc.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435795/news/media-2026/IMG_20260102_180748_960_1644603306_ovcanc.jpg"
                    },
                    {
                        "id": "uw-file4",
                        "batchId": "uw-batch2",
                        "asset_id": "d29a3c9e4481953daa2cc52bc12985fd",
                        "public_id": "news/media-2026/IMG_20260102_162701_409_1644603211_pppvzg",
                        "version": 1767435795,
                        "version_id": "2de21127a4d301901492451ee2d63cb1",
                        "signature": "91b910709c77b5e2df1a95e24680750b8b209834",
                        "width": 4160,
                        "height": 1872,
                        "format": "jpg",
                        "resource_type": "image",
                        "created_at": "2026-01-03T10:23:15Z",
                        "tags": [],
                        "bytes": 3833329,
                        "type": "upload",
                        "etag": "3e5116e30f4b9c62c2ba665b502c7e5e",
                        "placeholder": false,
                        "url": "http://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435795/news/media-2026/IMG_20260102_162701_409_1644603211_pppvzg.jpg",
                        "secure_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/v1767435795/news/media-2026/IMG_20260102_162701_409_1644603211_pppvzg.jpg",
                        "folder": "news/media-2026",
                        "access_mode": "public",
                        "existing": false,
                        "original_filename": "IMG_20260102_162701_409@1644603211",
                        "path": "v1767435795/news/media-2026/IMG_20260102_162701_409_1644603211_pppvzg.jpg",
                        "thumbnail_url": "https://res.cloudinary.com/dgp4vzn3m/image/upload/c_limit,h_60,w_90/v1767435795/news/media-2026/IMG_20260102_162701_409_1644603211_pppvzg.jpg"
                    }
                ],
                "_id": "6958ee7a2a7077eaec02862e"
            },
            {
                "text": "<p>When the final whistle blew on the 2nd of January, the contrast to the 26th of December could not have been starker. The 1-1 stalemate was a distant memory, replaced by a 4-0 declaration of intent. For KunbiahiFC, it was a harsh lesson in the difficulty of facing a motivated, settled side twice in the same fortress.</p>",
                "media": [],
                "_id": "6958ee7a2a7077eaec02862f"
            },
            {
                "text": "<p>For KonjiehiFC and their fans, it was the perfect start to 2026. It was a story of a team learning, adapting, and exploding into life. And at the center of it all was Alhaji, a man who turned a week of reflection into a weekend of unforgettable celebration, proving that the best New Year’s resolutions are the ones you score on the pitch.</p>",
                "media": [],
                "_id": "6958ee7a2a7077eaec028630"
            }
        ],
        "type": "general",
        "isPublished": true,
        "stats": {
            "isTrending": true,
            "isLatest": true,
            "viewCount": 24
        },
        "likes": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-11T17:35:54.670Z",
                "device": "c9cc7ea7-110a-459f-8669-8dcf661fe9d5",
                "_id": "6963df7da73b1546a8b17dee"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T07:33:42.987Z",
                "device": "961a6ae2-4e21-4010-8963-570812734d23",
                "_id": "6964a41b91fe7d3468bc11d6"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T10:27:56.985Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "6964cd7eec69e4f6dd3a1eea"
            }
        ],
        "comments": [
            {
                "name": "Aziza Ismail",
                "date": "2026-01-04T04:15:14.784Z",
                "comment": "<p>My community has been in my thoughts 🤔 💭 . Wonderful 😊 </p>",
                "image": "https://lh3.googleusercontent.com/a/ACg8ocIf17q-ttlEimqIrFjhnwCdad3yl1oK8DrzBXJkrXtDxAePtg=s96-c",
                "_id": "6959e95227cf3862fa33e8b7"
            },
            {
                "name": "baheuyiri",
                "date": "2026-01-03T15:17:22.851Z",
                "comment": "<p> Alhaji being mobbed by ecstatic teammates after his <span style=\"color: rgb(230, 0, 0);\">second </span>goal, a picture of pure joy and camaraderie.</p>",
                "image": "https://lh3.googleusercontent.com/a/ACg8ocLdIFE9dk9DT4IcI49W5PuL-2F5d0jJw1yRyXATl6recDPGow=s96-c",
                "_id": "6959330288f6565fe027780e"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:37:17.525Z",
                "comment": "",
                "image": "/_next/static/media/avatar.ec960789.png",
                "_id": "6959299d356f74b68222adfa"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-03T13:12:24.503Z",
                "comment": "<p>Fantastic </p>",
                "image": "https://lh3.googleusercontent.com/a/ACg8ocKHJSbNbRHS8KmtzLovJBHt1I1NnVEcwjQrDyGQTh-4Egj7Wg=s96-c",
                "_id": "6959298c356f74b68222adda"
            }
        ],
        "shares": [
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-03T10:35:58.309Z",
                "device": "unknown",
                "_id": "6959226888150b29a4e77f64"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-03T10:38:47.068Z",
                "device": "unknown",
                "_id": "6959226888150b29a4e77f65"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:06:38.545Z",
                "device": "unknown",
                "_id": "6959226f88150b29a4e77f6e"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:37:34.424Z",
                "device": "unknown",
                "_id": "695929ae356f74b68222aec9"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:37:39.411Z",
                "device": "unknown",
                "_id": "695929b3356f74b68222af11"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:38:35.394Z",
                "device": "unknown",
                "_id": "695929eb356f74b68222af8f"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:38:52.299Z",
                "device": "unknown",
                "_id": "695929fc356f74b68222afdf"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T15:46:31.980Z",
                "device": "unknown",
                "_id": "695939d762d67f4181f5af37"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T15:46:41.337Z",
                "device": "unknown",
                "_id": "695939e162d67f4181f5af75"
            },
            {
                "name": "baheuyiri",
                "date": "2026-01-03T15:50:46.157Z",
                "device": "unknown",
                "_id": "69593ad662d67f4181f5b02f"
            },
            {
                "name": "Aziza Ismail",
                "date": "2026-01-04T04:16:52.486Z",
                "device": "unknown",
                "_id": "6959e9b427cf3862fa33e96c"
            },
            {
                "name": "Aziza Ismail",
                "date": "2026-01-04T04:17:28.531Z",
                "device": "unknown",
                "_id": "6959e9d827cf3862fa33e9bd"
            },
            {
                "name": "Alhassan Ibrahim Tiehisung",
                "date": "2026-01-06T08:47:59.660Z",
                "device": "unknown",
                "_id": "695ccc420de8152defd6708c"
            },
            {
                "name": "Alhassan Ibrahim Tiehisung",
                "date": "2026-01-06T19:42:24.992Z",
                "device": "unknown",
                "_id": "695d65a1f17385ccd9fc3432"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T07:34:59.017Z",
                "device": "unknown",
                "_id": "6964a42391fe7d3468bc124e"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T07:36:34.093Z",
                "device": "unknown",
                "_id": "6964a48291fe7d3468bc1337"
            }
        ],
        "createdAt": "2026-01-03T10:24:58.645Z",
        "updatedAt": "2026-03-28T09:05:54.263Z",
        "__v": 3,
        "views": [
            {
                "name": "unknown",
                "date": "2026-01-03T13:49:41.347Z",
                "device": "a9030c9f-e482-4e99-b157-82bdb4cf69c1",
                "_id": "69591e7588150b29a4e77e9e"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T13:58:28.806Z",
                "device": "a9030c9f-e482-4e99-b157-82bdb4cf69c1",
                "_id": "6959208788150b29a4e77ee2"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:05:23.440Z",
                "device": "a9030c9f-e482-4e99-b157-82bdb4cf69c1",
                "_id": "6959222888150b29a4e77f23"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:06:20.788Z",
                "device": "a9030c9f-e482-4e99-b157-82bdb4cf69c1",
                "_id": "6959225d88150b29a4e77f48"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:36:04.421Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "69592954e928fa092ca824cf"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T14:36:59.155Z",
                "device": "f4d184a0-987d-44f2-91f8-9822e6c4da3a",
                "_id": "6959298b356f74b68222adbb"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T16:34:38.666Z",
                "device": "91fc3836-2475-4f64-8a1c-b022e136b332",
                "_id": "69594570ebcb3da80d2f6a68"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T22:37:47.232Z",
                "device": "ef46bad3-9f3f-46f7-8850-19ddb501ec3b",
                "_id": "69599a3b2e50c8d3eb791984"
            },
            {
                "name": "unknown",
                "date": "2026-01-03T22:41:13.376Z",
                "device": "84be3991-7ebd-4966-b410-2ba664e62959",
                "_id": "69599b0b1e11fb2d9487c44c"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T04:25:21.949Z",
                "device": "9050973d-6590-41bb-806c-37a00a498cd5",
                "_id": "6959ebb2af971830ad3b6a6b"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T06:50:26.723Z",
                "device": "b6e92322-3722-4892-8b09-c69aa3af4d96",
                "_id": "695a0db36a5f8aab3f1aacce"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T08:41:51.440Z",
                "device": "80e52b74-bda6-4f45-9945-f47d3602e0c7",
                "_id": "695a2830bac4908e3d5c9e09"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T10:03:36.633Z",
                "device": "88226458-3c81-4fb2-a830-983a0ba1ff35",
                "_id": "695a3af94a471788afd6bedc"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T14:43:25.141Z",
                "device": "93283655-f01d-4406-8ad6-fecb61546263",
                "_id": "695a7c8f9cacc9451e212909"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T14:48:15.260Z",
                "device": "20f2bcc7-a1d0-4a45-b937-7bc815adcff0",
                "_id": "695a7dafc5e52f5fbcd382f8"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T14:48:34.703Z",
                "device": "a9e3996c-b437-486b-aa06-31e9b20e5442",
                "_id": "695a7dc2c5e52f5fbcd38491"
            },
            {
                "name": "unknown",
                "date": "2026-01-04T14:50:56.541Z",
                "device": "26d85cc0-21ad-461d-bc3d-661ad891cb5a",
                "_id": "695a7e51c5e52f5fbcd3873b"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-04T22:17:26.478Z",
                "device": "961a6ae2-4e21-4010-8963-570812734d23",
                "_id": "695ae6f796c6482f4feded88"
            },
            {
                "name": "Alhassan Ibrahim Tiehisung",
                "date": "2026-01-05T02:28:24.258Z",
                "device": "c9cc7ea7-110a-459f-8669-8dcf661fe9d5",
                "_id": "695b21c8f4f42d2af11dcc79"
            },
            {
                "name": "unknown",
                "date": "2026-01-05T21:39:36.421Z",
                "device": "ef828d96-098b-4014-b20e-9d6ae886adbc",
                "_id": "695c2f9946c85a8a0e5b22c1"
            },
            {
                "name": "Ibrahim Alhassan Soskode",
                "date": "2026-01-11T15:05:11.368Z",
                "device": "fdb220e6-659c-4add-822b-07e46820be45",
                "_id": "6963bc2d1b228d94f8113afd"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T12:38:43.430Z",
                "device": "677b0fd4-c6ef-4e66-9047-cb24d1239cc0",
                "_id": "6964eb53fc63f607cbdee9a8"
            },
            {
                "name": "unknown",
                "date": "2026-01-12T12:38:45.421Z",
                "device": "88853f85-001c-4ca7-9d97-f41c74b50638",
                "_id": "6964eb562bb9898b7b73a979"
            },
            {
                "name": "unknown",
                "date": "2026-01-24T07:10:34.709Z",
                "device": "0c2e3358-79ec-43c2-8ec3-c8c307feec58",
                "_id": "6973ffd8934e49ba3b972226"
            },
            {
                "name": "unknown",
                "date": "2026-02-01T08:12:14.198Z",
                "device": "0d896cee-ebdb-4301-ab4a-68355a62dc04",
                "_id": "697f0ae0c35ee5e204436b31"
            }
        ],
        "editors": [],
        "status": "unpublished"
    }
]