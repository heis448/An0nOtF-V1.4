 document.addEventListener('DOMContentLoaded', () => {
        const yearSelect = document.getElementById('cc-year');
        const currentYear = new Date().getFullYear();
        const randomOption = yearSelect.querySelector('option[value="random"]');
        
        yearSelect.innerHTML = '';
        if (randomOption) {
            yearSelect.appendChild(randomOption);
        }

        for (let i = 0; i <= 20; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    });

    const CardUtils = {
    luhnCheck: (num) => {
        let arr = (num + '').split('').reverse();
        let sum = 0;
        
        for (let i = 0; i < arr.length; i++) {
        let digit = parseInt(arr[i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        }
        
        return sum % 10 === 0;
    },
    
    calculateLuhnCheckDigit: (partialNumber) => {
        const numberWithZero = partialNumber + '0';
        
        let sum = 0;
        let alternate = false;
        for (let i = numberWithZero.length - 1; i >= 0; i--) {
        let digit = parseInt(numberWithZero.charAt(i));
        if (alternate) {
            digit *= 2;
            if (digit > 9) {
            digit -= 9;
            }
        }
        sum += digit;
        alternate = !alternate;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit;
    },
    
    rand: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    pad: (num, size) => {
        let s = String(num);
        while (s.length < size) s = "0" + s;
        return s;
    },
    
    strrev: (str) => {
        return str.split("").reverse().join("");
    },
    
    detectCardType: (number) => {
        const patterns = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        jcb: /^(?:2131|1800|35\d{3})\d{11}$/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(number)) return type;
        }
        
        if (number.startsWith('4')) return 'visa';
        if (number.startsWith('5')) return 'mastercard';
        if (number.startsWith('34') || number.startsWith('37')) return 'amex';
        if (number.startsWith('6')) return 'discover';
        
        return 'unknown';
    },
    
    formatCardNumber: (number) => {
        if (!number) return '';
        
        const cleaned = number.replace(/\D/g, '');
        
        if (/^3[47]/.test(cleaned)) {
        return cleaned.replace(/^(\d{4})(\d{6})(\d{5})$/, '$1 $2 $3');
        } else {
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
    }
    };

    class CardGenerator {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.initDefaults();
        this.setupCardTypeDetection();
    }
    
    initElements() {
        this.binInput = document.getElementById('cc-bin');
        this.quantityInput = document.getElementById('cc-quantity');
        this.monthSelect = document.getElementById('cc-month');
        this.yearSelect = document.getElementById('cc-year');
        this.cvvSelect = document.getElementById('cc-cvv');
        this.generateBtn = document.getElementById('generate-btn');
        
        this.cardPreview = document.querySelector('.credit-card');
        this.cardNumberDisplay = document.querySelector('.credit-card-number');
        this.cardExpiryDisplay = document.querySelectorAll('.credit-card-info-value')[0];
        this.cardCvvDisplay = document.querySelectorAll('.credit-card-info-value')[1];
        this.generatedList = document.getElementById('generated-list');
        
        this.copyAllBtn = document.getElementById('copy-all-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.downloadBtn = document.getElementById('download-btn');
    }
    
    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateCards());
        this.binInput.addEventListener('input', () => this.handleBinInput());
        this.binInput.addEventListener('blur', () => this.addPlaceholder());
        
        this.copyAllBtn.addEventListener('click', () => this.copyAllCards());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        
        document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.background = 'rgba(255, 255, 255, 0.7)';
            ripple.style.borderRadius = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.transform = 'scale(0)';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
            ripple.remove();
            }, 600);
        });
        });
    }
    
    initDefaults() {
        this.cardLength = 16;
        this.quantity = 10;
        this.generatedCards = [];
    }
    
    setupCardTypeDetection() {
        this.binInput.addEventListener('input', () => {
        const bin = this.binInput.value.replace(/\s+/g, '');
        if (bin.length >= 2) {
            const cardType = this.detectCardTypeFromBin(bin);
            this.updateCardPreviewType(cardType);
        }
        });
    }
    
    detectCardTypeFromBin(bin) {
        if (bin.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(bin)) return 'mastercard';
        if (/^3[47]/.test(bin)) {
        this.cardLength = 15;
        return 'amex';
        }
        if (/^6/.test(bin)) return 'discover';
        
        this.cardLength = 16;
        return 'unknown';
    }
    
    updateCardPreviewType(cardType) {
        this.cardPreview.classList.remove('visa', 'mastercard', 'amex', 'discover', 'unknown');
        
        this.cardPreview.classList.add(cardType);
        
        const gradients = {
        visa: 'linear-gradient(135deg, #1A1F71 0%, #2B3990 100%)',
        mastercard: 'linear-gradient(135deg, #EB001B 0%, #FF5F00 50%, #F79E1B 100%)',
        amex: 'linear-gradient(135deg, #108168 0%, #0F6A88 100%)',
        discover: 'linear-gradient(135deg, #FF6600 0%, #D35400 100%)',
        unknown: 'linear-gradient(135deg, #333 0%, #111 100%)'
        };
        
        this.cardPreview.style.background = gradients[cardType] || gradients.unknown;
    }
    
    handleBinInput() {
        const input = this.binInput.value.replace(/[^0-9xX]/g, '');
        this.binInput.value = CardUtils.formatCardNumber(input);
    }
    
    addPlaceholder() {
        let bin = this.binInput.value.replace(/\s+/g, '');
        
        if (bin.length < 1) return;
        
        if (/^3[47]/.test(bin)) {
        this.cardLength = 15;
        } else {
        this.cardLength = 16;
        }
        
        bin = bin.replace(/X/g, 'x');
        
        bin = bin.replace(/[^0-9x]/g, '');
        
        let placeholder = '';
        for (let i = 0; i < this.cardLength - bin.length; i++) {
        placeholder += 'x';
        }
        
        this.binInput.value = CardUtils.formatCardNumber(bin + placeholder);
    }
    
    generateCards() {
        const bin = this.binInput.value.replace(/\s+/g, '');
        
        if (bin.length < 1) {
        this.showToast('Please enter a BIN or matrix pattern', 'error');
        return;
        }
        
        this.generatedList.innerHTML = '';
        this.generatedCards = [];
        
        const quantity = parseInt(this.quantityInput.value) || 10;
        
        for (let i = 0; i < quantity; i++) {
        const cardNumber = this.generateCardNumber(bin);
        const month = this.getMonth();
        const year = this.getYear();
        const cvv = this.getCVV(cardNumber);
        
        const card = {
            number: cardNumber,
            month: month,
            year: year,
            cvv: cvv,
            formatted: `${cardNumber}|${month}|${year}|${cvv}`
        };
        
        this.generatedCards.push(card);
        this.addCardToList(card);
        }
        
        if (this.generatedCards.length > 0) {
        this.updateCardPreview(this.generatedCards[0]);
        this.showToast(`Successfully generated ${quantity} cards`, 'success');
        }
        
        this.animateCards();
    }
    
    generateCardNumber(matrix) {
        let result = '';
        let partialNumber = '';
        
        for (let i = 0; i < matrix.length; i++) {
        const char = matrix[i].toLowerCase();
        if (char === 'x') {
            const randomDigit = CardUtils.rand(0, 9).toString();
            result += randomDigit;
            partialNumber += randomDigit;
        } else if (/[0-9]/.test(char)) {
            result += char;
            partialNumber += char;
        }
        
        if (result.length === this.cardLength - 1) break;
        }
        
        while (result.length < this.cardLength - 1) {
        const randomDigit = CardUtils.rand(0, 9).toString();
        result += randomDigit;
        partialNumber += randomDigit;
        }
        
        const checkDigit = CardUtils.calculateLuhnCheckDigit(result);
        result += checkDigit.toString();
        
        if (!CardUtils.luhnCheck(result)) {
        console.error("Generated card failed Luhn check:", result);
        return this.generateCardNumber(matrix);
        }
        
        return result;
    }
    
    getMonth() {
        const selectedMonth = this.monthSelect.value;
        if (selectedMonth && selectedMonth !== 'random') {
        return selectedMonth;
        }
        return CardUtils.pad(CardUtils.rand(1, 12), 2);
    }
    
    getYear() {
        const selectedYear = this.yearSelect.value;
        if (selectedYear && selectedYear !== 'random') {
        return selectedYear;
        }
        const currentYear = new Date().getFullYear();
        return (currentYear + CardUtils.rand(1, 7)).toString();
    }
    
    getCVV(cardNumber) {
        const selectedCVV = this.cvvSelect.value;
        if (selectedCVV === '3-digits') {
        return CardUtils.pad(CardUtils.rand(0, 999), 3);
        } else if (selectedCVV === '4-digits') {
        return CardUtils.pad(CardUtils.rand(0, 9999), 4);
        }
        
        return /^3[47]/.test(cardNumber) ? 
        CardUtils.pad(CardUtils.rand(0, 9999), 4) : 
        CardUtils.pad(CardUtils.rand(0, 999), 3);
    }
    
    updateCardPreview(card) {
        this.cardNumberDisplay.textContent = CardUtils.formatCardNumber(card.number);
        
        this.cardExpiryDisplay.textContent = `${card.month}/${card.year.slice(-2)}`;
        
        this.cardCvvDisplay.textContent = card.cvv;
        
        const cardType = CardUtils.detectCardType(card.number);
        this.updateCardPreviewType(cardType);
    }
    
    addCardToList(card) {
        const li = document.createElement('li');
        li.className = 'generated-item animate-fade-in';
        
        const span = document.createElement('span');
        span.className = 'generated-item-text';
        span.textContent = card.formatted;
        
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        button.addEventListener('click', () => {
        navigator.clipboard.writeText(card.formatted).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
            button.textContent = 'Copy';
            }, 2000);
        });
        });
        
        li.appendChild(span);
        li.appendChild(button);
        this.generatedList.appendChild(li);
    }
    
    animateCards() {
        const items = document.querySelectorAll('.generated-item');
        items.forEach((item, index) => {
        item.style.animationDelay = `${0.1 + index * 0.05}s`;
        });
    }
    
    copyAllCards() {
        if (this.generatedCards.length === 0) {
        this.showToast('No cards to copy', 'error');
        return;
        }
        
        const allCards = this.generatedCards.map(card => card.formatted).join('\n');
        
        navigator.clipboard.writeText(allCards).then(() => {
        this.showToast('All cards copied to clipboard', 'success');
        }).catch(err => {
        console.error('Failed to copy cards:', err);
        this.showToast('Failed to copy cards', 'error');
        });
    }
    
    clearResults() {
        this.generatedList.innerHTML = '';
        this.generatedCards = [];
        
        this.cardNumberDisplay.textContent = '4512 3456 7890 1234';
        this.cardExpiryDisplay.textContent = '05/25';
        this.cardCvvDisplay.textContent = '123';
        this.updateCardPreviewType('unknown');
        
        this.showToast('Results cleared', 'success');
    }
    
    downloadResults() {
        if (this.generatedCards.length === 0) {
        this.showToast('No cards to download', 'error');
        return;
        }
        
        const allCards = this.generatedCards.map(card => card.formatted).join('\n');
        const blob = new Blob([allCards], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_cards.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Cards downloaded as TXT file', 'success');
    }
    
    showToast(message, type = 'error') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
        existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
        toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
        }, 3000);
    }
    }

    document.addEventListener('DOMContentLoaded', () => {
    const generator = new CardGenerator();
    });