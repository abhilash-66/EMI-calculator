const form = document.getElementById('emi-form');
const result = document.getElementById('result');
const emiOutput = document.getElementById('emi-output');
const historyList = document.getElementById('history-list');
const plansList = document.getElementById('plans-list');
const ctx = document.getElementById('emi-chart').getContext('2d');

let chart;


function calculateEMI(P, r, n) {
    r = r / 12 / 100;
    if (n <= 0) return 0;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Handle form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const loanType = document.getElementById('loan-type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const interest = parseFloat(document.getElementById('interest').value);
    let tenure = parseFloat(document.getElementById('tenure').value);
    const tenureType = document.getElementById('tenure-type').value;

    if (tenureType === "years") {
        tenure = tenure * 12; 
    }

    const emi = calculateEMI(amount, interest, tenure).toFixed(2);

    emiOutput.innerHTML = `
        <strong>Loan Type:</strong> ${loanType} <br>
        <strong>Loan Amount:</strong> $${amount} <br>
        <strong>EMI:</strong> $${emi} per month
    `;

    result.classList.remove('hidden');

    addToHistory(loanType, amount, interest, tenure, emi);
    updateChart(amount, emi * tenure);
});

function updateChart(principal, totalPayment) {
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Interest Amount'],
            datasets: [{
                data: [principal, totalPayment - principal],
                backgroundColor: ['#4CAF50', '#FFC107'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function addToHistory(loanType, amount, interest, tenure, emi) {
    const li = document.createElement('li');
    li.innerHTML = `${loanType} - Amount: $${amount}, Rate: ${interest}%, Tenure: ${tenure} months, EMI: $${emi}`;
    historyList.prepend(li);
}

document.getElementById('download-pdf').addEventListener('click', () => {
    html2canvas(document.getElementById('emi-chart')).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
        pdf.save('emi-graph.pdf');
    });
});

document.getElementById('save-plan').addEventListener('click', () => {
    const planText = emiOutput.innerHTML.replace(/<br>/g, ' | ');
    const li = document.createElement('li');
    li.innerHTML = planText;
    plansList.prepend(li);
});
