// ========================================
// 商品管理機能
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: 商品のCRUD操作と在庫管理
// ========================================

let productsData = [];
let editingProductId = null;

// ========================================
// 商品データの読み込み
// ========================================
async function loadProductsData() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('name', { ascending: true });

        if (error) throw error;

        productsData = data || [];
        renderProductsTable(productsData);

    } catch (error) {
        console.error('商品データ読み込みエラー:', error);
        alert('商品データの読み込みに失敗しました');
    }
}

// ========================================
// 商品テーブルのレンダリング
// ========================================
function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">商品データがありません</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const status = getProductStockStatus(product);
        return `
            <tr data-product-id="${product.id}">
                <td>${escapeHtml(product.name)}</td>
                <td>${escapeHtml(product.sku || '-')}</td>
                <td>${product.current_stock}</td>
                <td>${product.min_stock}</td>
                <td>¥${product.price.toLocaleString()}</td>
                <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">編集</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">削除</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 在庫ステータスの判定
// ========================================
function getProductStockStatus(product) {
    if (product.current_stock <= 0) {
        return { class: 'danger', text: '在庫切れ' };
    } else if (product.current_stock <= product.min_stock) {
        return { class: 'warning', text: '少ない' };
    } else {
        return { class: 'ok', text: '在庫あり' };
    }
}

// ========================================
// モーダルを開く（新規追加）
// ========================================
function openProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = '新規商品追加';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'block';
}

// ========================================
// モーダルを開く（編集）
// ========================================
async function editProduct(productId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        editingProductId = productId;
        document.getElementById('productModalTitle').textContent = '商品編集';
        document.getElementById('productId').value = data.id;
        document.getElementById('productName').value = data.name;
        document.getElementById('productSku').value = data.sku || '';
        document.getElementById('productStock').value = data.current_stock;
        document.getElementById('productMinStock').value = data.min_stock;
        document.getElementById('productPrice').value = data.price;
        document.getElementById('productDescription').value = data.description || '';

        document.getElementById('productModal').style.display = 'block';

    } catch (error) {
        console.error('商品データ取得エラー:', error);
        alert('商品データの取得に失敗しました');
    }
}

// ========================================
// モーダルを閉じる
// ========================================
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

// ========================================
// 商品の保存（新規作成 or 更新）
// ========================================
async function saveProduct(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('productName').value.trim(),
        sku: document.getElementById('productSku').value.trim() || null,
        current_stock: parseFloat(document.getElementById('productStock').value) || 0,
        min_stock: parseFloat(document.getElementById('productMinStock').value) || 0,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        description: document.getElementById('productDescription').value.trim() || null,
        user_id: currentUser.id
    };

    try {
        if (editingProductId) {
            // 更新
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProductId);

            if (error) throw error;
            alert('商品を更新しました');
        } else {
            // 新規作成
            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) throw error;
            alert('商品を追加しました');
        }

        closeProductModal();
        await loadProductsData();
        await loadDashboardData(); // ダッシュボードも更新

    } catch (error) {
        console.error('商品保存エラー:', error);
        alert('商品の保存に失敗しました: ' + error.message);
    }
}

// ========================================
// 商品の削除
// ========================================
async function deleteProduct(productId) {
    if (!confirm('この商品を削除しますか？')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        alert('商品を削除しました');
        await loadProductsData();
        await loadDashboardData(); // ダッシュボードも更新

    } catch (error) {
        console.error('商品削除エラー:', error);
        alert('商品の削除に失敗しました: ' + error.message);
    }
}

// ========================================
// 検索機能
// ========================================
function searchProducts() {
    const searchTerm = document.getElementById('productsSearchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        renderProductsTable(productsData);
        return;
    }

    const filteredProducts = productsData.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );

    renderProductsTable(filteredProducts);
}

// ========================================
// イベントリスナーの設定
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // 新規追加ボタン
    const addProductButton = document.getElementById('addProductButton');
    if (addProductButton) {
        addProductButton.addEventListener('click', openProductModal);
    }

    // モーダル閉じるボタン
    const closeProductModalButton = document.getElementById('closeProductModal');
    if (closeProductModalButton) {
        closeProductModalButton.addEventListener('click', closeProductModal);
    }

    // キャンセルボタン
    const cancelProductButton = document.getElementById('cancelProductButton');
    if (cancelProductButton) {
        cancelProductButton.addEventListener('click', closeProductModal);
    }

    // フォーム送信
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }

    // 検索ボタン
    const productsSearchButton = document.getElementById('productsSearchButton');
    if (productsSearchButton) {
        productsSearchButton.addEventListener('click', searchProducts);
    }

    // 検索入力でEnterキー
    const productsSearchInput = document.getElementById('productsSearchInput');
    if (productsSearchInput) {
        productsSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    // モーダル外クリックで閉じる
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }
});
