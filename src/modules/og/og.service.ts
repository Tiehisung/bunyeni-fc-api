//modules/og/og.service.ts
import { createCanvas, loadImage } from "canvas";

interface OgImageOptions {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    type?: "player" | "match" | "news" | "default";
}

export async function generateOgImage(options: OgImageOptions): Promise<Buffer> {
    const { title, subtitle, imageUrl, type = "default" } = options;

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    const gradients: Record<string, string[]> = {
        default: ["#1a1a2e", "#16213e"],
        player: ["#0f3460", "#1a1a2e"],
        match: ["#2c1810", "#1a1a2e"],
        news: ["#1e3a5f", "#0f3460"],
    };

    const [start, end] = gradients[type] || gradients.default;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Red accent bar
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, width, 8);

    // Logo
    try {
        const logo = await loadImage(process.env.LOGO_URL!);
        ctx.drawImage(logo, 60, 60, 100, 100);
    } catch (_) { }

    // Image
    if (imageUrl) {
        try {
            const img = await loadImage(imageUrl);
            ctx.save();
            if (type === "player") {
                ctx.beginPath();
                ctx.arc(width - 210, 210, 150, 0, Math.PI * 2);
                ctx.clip();
            }
            ctx.drawImage(img, width - 360, 60, 300, 300);
            ctx.restore();
        } catch (_) { }
    }

    // Club name
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(process.env.APP_NAME!, 180, 110);

    // Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 52px sans-serif";

    const maxWidth = imageUrl ? width - 420 : width - 120;
    const words = title.split(" ");
    let line = "";
    let y = 280;

    for (const word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
            ctx.fillText(line, 60, y);
            line = word + " ";
            y += 70;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 60, y);

    // Subtitle
    if (subtitle) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "28px sans-serif";
        ctx.fillText(subtitle, 60, y + 70);
    }

    // Footer
    ctx.fillStyle = "#0a0a15";
    ctx.fillRect(0, height - 60, width, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px sans-serif";
    ctx.fillText(process.env.FRONTEND_URL!.replace("https://", ""), 60, height - 22);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(60, height - 45, 80, 3);

    return canvas.toBuffer("image/png");
}