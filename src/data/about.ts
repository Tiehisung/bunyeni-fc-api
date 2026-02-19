import { EPlayerPosition } from "../types/player.interface";



const positionDescriptions: Record<EPlayerPosition, string> = {
    "goal keeper":
        "is a commanding presence between the posts, known for sharp reflexes, anticipation, and calmness under pressure. Their leadership from the back keeps the defense well-organized and confident.",
    defender:
        "is a solid and composed figure in the backline, excelling in reading the game, tackling, and winning aerial duels. Their discipline and awareness make them a cornerstone of the team's defense.",
    midfielder:
        "is the heartbeat of the team, linking defense and attack with precision passing, tactical vision, and relentless energy. They control the flow of play and dictate the game’s tempo.",
    forward:
        "is a creative and determined attacker who thrives in tight spaces, constantly looking to create scoring chances and stretch opposition defenses.",
    striker:
        "is a clinical finisher with natural instincts in front of goal. Their movement and composure make them a constant scoring threat and focal point in attack.",
    "wing back":
        "is an energetic and versatile player who combines defensive stability with attacking runs down the flanks. Their stamina and crossing ability are vital to both ends of the pitch.",
    "center back":
        "is a commanding defender with strength, composure, and leadership qualities. They excel in reading the game and organizing the defense under pressure.",
    "attacking midfielder":
        "is the creative spark behind the forwards, skilled at unlocking defenses with clever passes, vision, and technical ability.",
    "defensive midfielder":
        "is a disciplined and resilient player who shields the defense, breaks up opposition attacks, and distributes the ball efficiently under pressure.",
    winger:
        "is a pacey and skillful wide player who stretches defenses and delivers quality balls into the box. Their flair and dribbling make them a constant attacking threat.",
    sweeper:
        "is an intelligent and composed defender who reads the game brilliantly, sweeping up loose balls and initiating plays from deep positions.",
};

export function generatePlayerAbout(firstName: string, lastName: string, position?: EPlayerPosition): string {
    const baseDescription =
        positionDescriptions[position as EPlayerPosition] ||
        "is a talented and dedicated player known for versatility, hard work, and consistency on the field.";

    return `<b>${lastName?.toUpperCase()}</b> ${firstName?.toUpperCase()} ${baseDescription} for KFC. ${firstName} continues to grow as a player, showing professionalism, discipline, and a love for the game.`;
}
