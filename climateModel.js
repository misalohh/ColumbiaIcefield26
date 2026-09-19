const modelThickness = 300;

export function calculateBalance(T) {
    const precipitation = 1.88;
    const snowfallFraction = 0.81 - 0.05 * T;
    const melting = 2.22 + 0.65 * T;

    const accumulation = precipitation * snowfallFraction;
    const balance = accumulation - melting;

    return balance;
}

export function calculateIcePercent(climateData, scenario, targetYear) {
    let cumulativeBalance = 0;

    for (const data of climateData) {
        if (data.year >= targetYear) {
            break;
        }

        const temperature = data[scenario];
        const balance = calculateBalance(temperature);

        cumulativeBalance += balance;
    }

    const totalPercentageLoss = (-cumulativeBalance / modelThickness) * 100;
    const icePercent = 100 - totalPercentageLoss;

    return Math.max(0, icePercent); //no negatives
}