// ===== DATA & VARIABEL GLOBAL =====
        let transactions = [];
        let transactionIdCounter = 1;
        let currentDiscount = 0;
        let appliedPromoCode = '';

        // Database kode promo
        const promoCodes = {
            'DENIMDAY' : {discount: 10, type: 'percentage', description: 'Diskon 10%'},
            'DENIMCLEAR' : {discount: 20, type: 'percentage', description: 'Diskon 20%'},
            'DENIMHYP' : {discount: 50000, type: 'fixed', description: 'Diskon Rp 50.000'},
            'DENIMCRUSH' : {discount: 25, type: 'percentage', description: 'Diskon 25%'},
            'DENIMTRASH' : {discount: 100000, type: 'fixed', description: 'Diskon Rp 100.000'},
            'DENIMDREAM' : {discount: 50, type: 'percentage', description: 'Diskon 50%'},
            'DENIMUNI' : {discount: 150000, type: 'fixed', description: 'Diskon Rp 150.000'}
        }


        // Mapping metode pembayaran dengan warna
        const paymentMethodColors = {
            'transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100', // Added dark mode classes
            'ewallet': 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100', // Added dark mode classes
            'credit': 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100', // Added dark mode classes
            'cash': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' // Added dark mode classes
        };

        // Mapping nama metode pembayaran
        const paymentMethodNames = {
            'transfer': 'Transfer Bank',
            'ewallet': 'E-Wallet',
            'credit': 'Kartu Kredit',
            'cash': 'Bayar Tunai'
        };

        // ===== MENDAPATKAN ELEMEN DOM =====
        const paymentForm = document.getElementById('paymentForm');
        const productSelect = document.getElementById('productSelect');
        const quantity = document.getElementById('quantity');
        const promoCode = document.getElementById('promoCode');
        const applyPromoBtn = document.getElementById('applyPromoBtn');
        const promoMessage = document.getElementById('promoMessage');
        const paymentMethodRadios = document.getElementById('paymentMethodRadios'); // New: get radios container
        const nonCashPaymentForm = document.getElementById('nonCashPaymentForm'); // New: get non-cash form container
        const paymentFormContent = document.getElementById('paymentFormContent'); // New: get content div for dynamic form
        
        // Elemen untuk menampilkan total
        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount');
        const discountRow = document.getElementById('discountRow');
        const totalAmountEl = document.getElementById('totalAmount');
        
        // Elemen riwayat transaksi
        const transactionList = document.getElementById('transactionList');
        const emptyState = document.getElementById('emptyState');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Elemen statistik
        const totalTransactionsEl = document.getElementById('totalTransactions');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const avgTransactionEl = document.getElementById('avgTransaction');
        
        // Modal
        const paymentModal = document.getElementById('paymentModal');
        const paymentDetails = document.getElementById('paymentDetails');
        const closeModalBtn = document.getElementById('closeModalBtn');

        // ===== FUNGSI UTILITY =====
        
        // Format mata uang Rupiah
        function formatCurrency(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }

        // Format waktu
        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit' // Added seconds for more unique timestamp
            });
        }

        // Generate transaction ID
        function generateTransactionId() {
            return 'TRX' + Date.now().toString().substr(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        }

        // ===== FUNGSI KALKULASI =====
        
        // Hitung subtotal
        function calculateSubtotal() {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (!selectedOption || !selectedOption.dataset.price) return 0;
            
            const price = parseInt(selectedOption.dataset.price);
            const qty = parseInt(quantity.value) || 1;
            return price * qty;
        }

        // Hitung diskon
        function calculateDiscount(subtotal, promoData) {
            if (!promoData) return 0;
            
            if (promoData.type === 'percentage') {
                return Math.round(subtotal * promoData.discount / 100);
            } else {
                return Math.min(promoData.discount, subtotal);
            }
        }

        // Update tampilan total
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

        // ===== FUNGSI PROMO CODE =====
        
        // Terapkan kode promo
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

        // Tampilkan pesan promo
        function showPromoMessage(message, type) {
            promoMessage.textContent = message;
            promoMessage.classList.remove('hidden', 'text-red-500', 'text-green-500');
            promoMessage.classList.add(type === 'error' ? 'text-red-500' : 'text-green-500');
        }

        // Reset promo code
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

        // ===== FUNGSI TRANSAKSI =====
        
        // Proses pembayaran
        function processPayment(formData) {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const subtotal = calculateSubtotal();
            const total = subtotal - currentDiscount;
            const paymentMethod = formData.get('paymentMethod');

            let paymentDetailsData = {};
            if (paymentMethod === 'credit') {
                paymentDetailsData = {
                    cardNumber: formData.get('cardNumber'),
                    expiryDate: formData.get('expiryDate'),
                    cvv: formData.get('cvv')
                };
            } else if (paymentMethod === 'ewallet') {
                paymentDetailsData = {
                    eWalletProvider: formData.get('eWalletProvider'),
                    eWalletPhone: formData.get('eWalletPhone')
                };
            }

            const transaction = {
                id: generateTransactionId(),
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                product: selectedOption.textContent,
                productValue: selectedOption.value,
                quantity: parseInt(formData.get('quantity')),
                paymentMethod: paymentMethod,
                paymentDetails: paymentDetailsData, // Store payment details
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

        // Tampilkan modal konfirmasi (sekarang sebagai Invoice)
        function showPaymentModal(transaction) {
            let additionalDetailsHtml = '';

            // Add non-cash payment details to invoice
            if (transaction.paymentMethod === 'credit') {
                additionalDetailsHtml = `
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">No. Kartu:</span>
                        <span class="font-medium">${transaction.paymentDetails.cardNumber.replace(/.(?=.{4})/g, '*')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Kadaluarsa:</span>
                        <span class="font-medium">${transaction.paymentDetails.expiryDate}</span>
                    </div>
                `;
            } else if (transaction.paymentMethod === 'ewallet') {
                additionalDetailsHtml = `
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Provider E-Wallet:</span>
                        <span class="font-medium">${transaction.paymentDetails.eWalletProvider}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">No. Telepon:</span>
                        <span class="font-medium">${transaction.paymentDetails.eWalletPhone}</span>
                    </div>
                `;
            } else if (transaction.paymentMethod === 'transfer') {
                 additionalDetailsHtml = `
                    <div class="text-center mt-2">
                        <p class="text-gray-700 dark:text-gray-200">Silakan transfer ke:</p>
                        <p class="font-semibold text-lg text-blue-600 dark:text-blue-400">BANK ABC - 1234567890</p>
                        <p class="text-gray-700 dark:text-gray-200">Atas Nama: PT Global Instituted</p>
                    </div>
                 `;
            }


            paymentDetails.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">ID Transaksi:</span>
                        <span class="font-medium">${transaction.id}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Tanggal:</span>
                        <span class="font-medium">${transaction.time}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Nama Pelanggan:</span>
                        <span class="font-medium">${transaction.customerName}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Email:</span>
                        <span class="font-medium">${transaction.customerEmail}</span>
                    </div>
                    <hr class="my-2 border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Produk:</span>
                        <span class="font-medium">${transaction.product} (${transaction.quantity}x)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Metode Pembayaran:</span>
                        <span class="font-medium">${paymentMethodNames[transaction.paymentMethod]}</span>
                    </div>
                    ${additionalDetailsHtml}
                    ${transaction.promoCode ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300">Kode Promo:</span>
                        <span class="font-medium">${transaction.promoCode}</span>
                    </div>
                    ` : ''}
                    <hr class="my-2 border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between text-gray-800 dark:text-gray-100">
                        <span>Subtotal:</span>
                        <span class="font-medium">${formatCurrency(transaction.subtotal)}</span>
                    </div>
                    ${transaction.discount > 0 ? `
                    <div class="flex justify-between text-green-600 dark:text-green-300">
                        <span>Diskon:</span>
                        <span class="font-medium">-${formatCurrency(transaction.discount)}</span>
                    </div>
                    ` : ''}
                    <hr class="my-2 border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
                        <span>Total Bayar:</span>
                        <span class="text-blue-600 dark:text-blue-400">${formatCurrency(transaction.total)}</span>
                    </div>
                </div>
            `;
            
            paymentModal.classList.remove('hidden');
            paymentModal.classList.add('flex');
        }

        // Tutup modal
        function closeModal() {
            paymentModal.classList.add('hidden');
            paymentModal.classList.remove('flex');
        }

        // ===== FUNGSI RIWAYAT TRANSAKSI =====
        
        // Buat elemen transaksi
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

        // Render daftar transaksi
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

        // Update statistik
        function updateStatistics() {
            const totalTrans = transactions.length;
            const totalRev = transactions.reduce((sum, t) => sum + t.total, 0);
            const avgTrans = totalTrans > 0 ? totalRev / totalTrans : 0;

            totalTransactionsEl.textContent = totalTrans;
            totalRevenueEl.textContent = formatCurrency(totalRev);
            avgTransactionEl.textContent = formatCurrency(avgTrans);
        }

        // Hapus semua riwayat
        function clearAllHistory() {
            if (transactions.length === 0) return;
            
            if (confirm('Apakah Anda yakin ingin menghapus semua riwayat transaksi?')) {
                transactions = [];
                renderTransactions();
            }
        }

        // Reset form
        function resetForm() {
            paymentForm.reset();
            resetPromoCode();
            updateTotal();
            hideNonCashPaymentForm(); // New: hide non-cash form on reset
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

        // ===== FUNGSI UNTUK FORM PEMBAYARAN NON-TUNAI =====
        function showNonCashPaymentForm(method) {
            paymentFormContent.innerHTML = ''; // Clear previous content
            nonCashPaymentForm.classList.remove('hidden'); // Show the container

            if (method === 'credit') {
                paymentFormContent.innerHTML = `
                    <div>
                        <label for="cardNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Kartu Kredit</label>
                        <input type="text" id="cardNumber" name="cardNumber" placeholder="XXXX XXXX XXXX XXXX" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" required pattern="[0-9]{16}" title="Masukkan 16 digit angka kartu">
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label for="expiryDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Kadaluarsa</label>
                            <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" required pattern="(0[1-9]|1[0-2])\\/[0-9]{2}" title="Format MM/YY">
                        </div>
                        <div class="flex-1">
                            <label for="cvv" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                            <input type="text" id="cvv" name="cvv" placeholder="XXX" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" required pattern="[0-9]{3,4}" title="3 atau 4 digit angka di belakang kartu">
                        </div>
                    </div>
                `;
            } else if (method === 'ewallet') {
                paymentFormContent.innerHTML = `
                    <div>
                        <label for="eWalletProvider" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih E-Wallet Provider</label>
                        <select id="eWalletProvider" name="eWalletProvider" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" required>
                            <option value="">Pilih...</option>
                            <option value="OVO">OVO</option>
                            <option value="GoPay">GoPay</option>
                            <option value="Dana">Dana</option>
                            <option value="LinkAja">LinkAja</option>
                        </select>
                    </div>
                    <div>
                        <label for="eWalletPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Telepon E-Wallet</label>
                        <input type="tel" id="eWalletPhone" name="eWalletPhone" placeholder="Contoh: 081234567890" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" required pattern="[0-9]{10,13}" title="Masukkan nomor telepon yang valid (10-13 digit)">
                    </div>
                `;
            }
        }

        function hideNonCashPaymentForm() {
            nonCashPaymentForm.classList.add('hidden');
            paymentFormContent.innerHTML = '';
        }

        function validateNonCashForm(paymentMethod) {
            if (paymentMethod === 'credit') {
                const cardNumber = document.getElementById('cardNumber').value;
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;

                if (!cardNumber || !expiryDate || !cvv) {
                    alert('Mohon lengkapi detail Kartu Kredit Anda.');
                    return false;
                }
                if (!/^[0-9]{16}$/.test(cardNumber)) {
                    alert('Nomor Kartu Kredit harus 16 digit angka.');
                    return false;
                }
                if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate)) {
                    alert('Format Tanggal Kadaluarsa harus MM/YY.');
                    return false;
                }
                 // Basic CVV validation: 3 or 4 digits
                if (!/^[0-9]{3,4}$/.test(cvv)) {
                    alert('CVV tidak valid (harus 3 atau 4 digit angka).');
                    return false;
                }
            } else if (paymentMethod === 'ewallet') {
                const eWalletProvider = document.getElementById('eWalletProvider').value;
                const eWalletPhone = document.getElementById('eWalletPhone').value;

                if (!eWalletProvider || !eWalletPhone) {
                    alert('Mohon lengkapi detail E-Wallet Anda.');
                    return false;
                }
                if (!/^[0-9]{10,13}$/.test(eWalletPhone)) {
                    alert('Nomor Telepon E-Wallet tidak valid (10-13 digit angka).');
                    return false;
                }
            }
            return true;
        }

        // ===== EVENT LISTENERS =====
        
        // Form submission
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(paymentForm);
            const selectedPaymentMethod = formData.get('paymentMethod');
            
            // Validasi metode pembayaran
            if (!selectedPaymentMethod) {
                alert('Silakan pilih metode pembayaran');
                return;
            }

            // Validasi form non-tunai jika relevan
            if (selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'ewallet') {
                if (!validateNonCashForm(selectedPaymentMethod)) {
                    return; // Stop submission if validation fails
                }
            }

            // Validasi total > 0
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

        // Event listener for payment method radio buttons
        paymentMethodRadios.addEventListener('change', function(e) {
            const selectedMethod = e.target.value;
            if (selectedMethod === 'credit' || selectedMethod === 'ewallet') {
                showNonCashPaymentForm(selectedMethod);
            } else {
                hideNonCashPaymentForm();
            }
        });

        // Product select dan quantity change
        productSelect.addEventListener('change', updateTotal);
        quantity.addEventListener('input', updateTotal);

        // Promo code
        applyPromoBtn.addEventListener('click', applyPromoCode);
        promoCode.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });

        // Modal controls
        closeModalBtn.addEventListener('click', closeModal);
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closeModal();
            }
        });

        // Clear history
        clearHistoryBtn.addEventListener('click', clearAllHistory);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !paymentModal.classList.contains('hidden')) {
                closeModal();
            }
        });

        // ===== INISIALISASI =====
        
        // Initialize app
        function initApp() {
            updateTotal();
            renderTransactions();
            hideNonCashPaymentForm(); // Ensure non-cash form is hidden on load
            
            // Focus ke input nama saat halaman dimuat
            document.getElementById('customerName').focus();
        }

        // Jalankan saat DOM siap
        document.addEventListener('DOMContentLoaded', initApp);