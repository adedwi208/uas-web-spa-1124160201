
        let transactions = [];
        let transactionIdCounter = 1;
        let currentDiscount = 0;
        let appliedPromoCode = '';

        const promoCodes = {
            'DENIMDAY' : {discount: 10, type: 'percentage', description: 'Diskon 10%'},
            'DENIMCLEAR' : {discount: 20, type: 'percentage', description: 'Diskon 20%'},
            'DENIMHYP' : {discount: 50000, type: 'fixed', description: 'Diskon Rp 50.000'},
            'DENIMCRUSH' : {discount: 25, type: 'percentage', description: 'Diskon 25%'},
            'DENIMTRASH' : {discount: 100000, type: 'fixed', description: 'Diskon Rp 100.000'},
            'DENIMDREAM' : {discount: 50, type: 'percentage', description: 'Diskon 50%'},
            'DENIMUNI' : {discount: 150000, type: 'fixed', description: 'Diskon Rp 150.000'}
        }


        const paymentMethodColors = {
            'transfer': 'bg-blue-100 text-blue-800',
            'ewallet': 'bg-purple-100 text-purple-800',
            'credit': 'bg-orange-100 text-orange-800',
            'cash': 'bg-green-100 text-green-800'
        };

        const paymentMethodNames = {
            'transfer': 'Transfer Bank',
            'ewallet': 'E-Wallet',
            'credit': 'Kartu Kredit',
            'cash': 'Bayar Tunai'
        };

        paymentForm = document.getElementById('paymentForm');
        const productSelect = document.getElementById('productSelect');
        const quantity = document.getElementById('quantity');
        const promoCode = document.getElementById('promoCode');
        const applyPromoBtn = document.getElementById('applyPromoBtn');
        const promoMessage = document.getElementById('promoMessage');
        
        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount');
        const discountRow = document.getElementById('discountRow');
        const totalAmountEl = document.getElementById('totalAmount');
        
        const transactionList = document.getElementById('transactionList');
        const emptyState = document.getElementById('emptyState');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        const totalTransactionsEl = document.getElementById('totalTransactions');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const avgTransactionEl = document.getElementById('avgTransaction');
        
        const paymentModal = document.getElementById('paymentModal');
        const paymentDetails = document.getElementById('paymentDetails');
        const closeModalBtn = document.getElementById('closeModalBtn');

        function formatCurrency(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }

        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function generateTransactionId() {
            return 'TRX' + Date.now().toString().substr(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        }

        function calculateSubtotal() {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (!selectedOption || !selectedOption.dataset.price) return 0;
            
            const price = parseInt(selectedOption.dataset.price);
            const qty = parseInt(quantity.value) || 1;
            return price * qty;
        }

        function calculateDiscount(subtotal, promoData) {
            if (!promoData) return 0;
            
            if (promoData.type === 'percentage') {
                return Math.round(subtotal * promoData.discount / 100);
            } else {
                return Math.min(promoData.discount, subtotal);
            }
        }

        function updateTotal() {
            const subtotal = calculateSubtotal();
            const promoData = appliedPromoCode ? promoCodes[appliedPromoCode] : null;
            const discount = calculateDiscount(subtotal, promoData);
            const total = subtotal - discount;

            subtotalEl.textContent = formatCurrency(subtotal);
            
            if (discount > 0) {
                discountEl.textContent = '-' + formatCurrency(discount);
                discountRow.classList.remove('hidden');
            } else {
                discountRow.classList.add('hidden');
            }
            
            totalAmountEl.textContent = formatCurrency(total);
            currentDiscount = discount;
        }

        
        function applyPromoCode() {
            const code = promoCode.value.trim().toUpperCase();
            
            if (!code) {
                showPromoMessage('Masukkan kode promo terlebih dahulu', 'error');
                return;
            }

            if (!promoCodes[code]) {
                showPromoMessage('Kode promo tidak valid', 'error');
                return;
            }

            appliedPromoCode = code;
            updateTotal();
            showPromoMessage(`Kode promo "${code}" berhasil diterapkan! ${promoCodes[code].description}`, 'success');
            promoCode.disabled = true;
            applyPromoBtn.textContent = 'Diterapkan';
            applyPromoBtn.disabled = true;
            applyPromoBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            applyPromoBtn.classList.add('bg-gray-400');
        }

        function showPromoMessage(message, type) {
            promoMessage.textContent = message;
            promoMessage.classList.remove('hidden', 'text-red-500', 'text-green-500');
            promoMessage.classList.add(type === 'error' ? 'text-red-500' : 'text-green-500');
        }

        function resetPromoCode() {
            appliedPromoCode = '';
            currentDiscount = 0;
            promoCode.value = '';
            promoCode.disabled = false;
            applyPromoBtn.textContent = 'Terapkan';
            applyPromoBtn.disabled = false;
            applyPromoBtn.classList.remove('bg-gray-400');
            applyPromoBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            promoMessage.classList.add('hidden');
            updateTotal();
        }

        function processPayment(formData) {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const subtotal = calculateSubtotal();
            const total = subtotal - currentDiscount;

            const transaction = {
                id: generateTransactionId(),
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                product: selectedOption.textContent,
                productValue: selectedOption.value,
                quantity: parseInt(formData.get('quantity')),
                paymentMethod: formData.get('paymentMethod'),
                promoCode: appliedPromoCode,
                subtotal: subtotal,
                discount: currentDiscount,
                total: total,
                timestamp: new Date(),
                time: getCurrentTime(),
                status: 'success'
            };

            transactions.push(transaction);
            return transaction;
        }

        function showPaymentModal(transaction) {
            paymentDetails.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">ID Transaksi:</span>
                        <span class="font-medium">${transaction.id}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Nama:</span>
                        <span class="font-medium">${transaction.customerName}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Produk:</span>
                        <span class="font-medium">${transaction.product}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Jumlah:</span>
                        <span class="font-medium">${transaction.quantity}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Metode:</span>
                        <span class="font-medium">${paymentMethodNames[transaction.paymentMethod]}</span>
                    </div>
                    ${transaction.discount > 0 ? `
                    <div class="flex justify-between text-green-600">
                        <span>Diskon:</span>
                        <span class="font-medium">-${formatCurrency(transaction.discount)}</span>
                    </div>
                    ` : ''}
                    <hr class="my-2">
                    <div class="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span class="text-green-600">${formatCurrency(transaction.total)}</span>
                    </div>
                </div>
            `;
            
            paymentModal.classList.remove('hidden');
            paymentModal.classList.add('flex');
        }
        function closeModal() {
            paymentModal.classList.add('hidden');
            paymentModal.classList.remove('flex');
        }

        function createTransactionElement(transaction) {
            const template = document.getElementById('transactionTemplate');
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.transaction-customer').textContent = transaction.customerName;
            clone.querySelector('.transaction-product').textContent = `${transaction.product} (${transaction.quantity}x)`;
            clone.querySelector('.transaction-amount').textContent = formatCurrency(transaction.total);
            clone.querySelector('.transaction-time').textContent = transaction.time;
            
            const methodEl = clone.querySelector('.transaction-method');
            methodEl.textContent = paymentMethodNames[transaction.paymentMethod];
            methodEl.className += ' ' + paymentMethodColors[transaction.paymentMethod];
            
            return clone;
        }

        function renderTransactions() {
            const transactionItems = transactionList.querySelectorAll('[data-transaction-id]');
            transactionItems.forEach(item => item.remove());

            if (transactions.length === 0) {
                emptyState.style.display = 'block';
                clearHistoryBtn.classList.add('hidden');
            } else {
                emptyState.style.display = 'none';
                clearHistoryBtn.classList.remove('hidden');

                const sortedTransactions = [...transactions].reverse();
                sortedTransactions.forEach(transaction => {
                    const transactionElement = createTransactionElement(transaction);
                    const container = transactionElement.querySelector('div');
                    container.setAttribute('data-transaction-id', transaction.id);
                    transactionList.appendChild(transactionElement);
                });
            }

            updateStatistics();
        }

        function updateStatistics() {
            const totalTrans = transactions.length;
            const totalRev = transactions.reduce((sum, t) => sum + t.total, 0);
            const avgTrans = totalTrans > 0 ? totalRev / totalTrans : 0;

            totalTransactionsEl.textContent = totalTrans;
            totalRevenueEl.textContent = formatCurrency(totalRev);
            avgTransactionEl.textContent = formatCurrency(avgTrans);
        }
        function clearAllHistory() {
            if (transactions.length === 0) return;
            
            if (confirm('Apakah Anda yakin ingin menghapus semua riwayat transaksi?')) {
                transactions = [];
                renderTransactions();
            }
        }

        function resetForm() {
            paymentForm.reset();
            resetPromoCode();
            updateTotal();
        }

        // ===Toogle Drak mode=== //   
        const toggleBtn = document.getElementById('toggleDarkMode');
        const html = document.documentElement;

        // Cek preferensi awal dari localStorage
        if (localStorage.getItem('theme') === 'dark') {
                html.classList.add('dark');
            }

        toggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleBtn.textContent = isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap';
        });

        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(paymentForm);
            
            if (!formData.get('paymentMethod')) {
                alert('Silakan pilih metode pembayaran');
                return;
            }

            const total = calculateSubtotal() - currentDiscount;
            if (total <= 0) {
                alert('Total pembayaran harus lebih dari 0');
                return;
            }

            try {
                const transaction = processPayment(formData);
                showPaymentModal(transaction);
                renderTransactions();
                resetForm();
            } catch (error) {
                alert('Terjadi kesalahan saat memproses pembayaran');
                console.error('Payment error:', error);
            }
        });

        productSelect.addEventListener('change', updateTotal);
        quantity.addEventListener('input', updateTotal);

        applyPromoBtn.addEventListener('click', applyPromoCode);
        promoCode.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });

        closeModalBtn.addEventListener('click', closeModal);
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closeModal();
            }
        });

        clearHistoryBtn.addEventListener('click', clearAllHistory);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !paymentModal.classList.contains('hidden')) {
                closeModal();
            }
        });

        function initApp() {
            updateTotal();
            renderTransactions();
            
            document.getElementById('customerName').focus();
        }

        document.addEventListener('DOMContentLoaded', initApp);