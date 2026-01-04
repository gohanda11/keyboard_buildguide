// ========================================
// 部品管理機能
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: 部品のCRUD操作と在庫管理
// ========================================

let partsData = [];
let editingPartId = null;
let selectedPartId = null;
let selectedPartSuppliers = [];

// ========================================
// 部品データの読み込み
// ========================================
async function loadPartsData() {
    try {
        const { data, error } = await supabase
            .from('parts')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('name', { ascending: true });

        if (error) throw error;

        partsData = data || [];
        renderPartsTable(partsData);

    } catch (error) {
        console.error('部品データ読み込みエラー:', error);
        alert('部品データの読み込みに失敗しました');
    }
}

// ========================================
// 部品テーブルのレンダリング
// ========================================
function renderPartsTable(parts) {
    const tbody = document.getElementById('partsTableBody');

    if (parts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">部品データがありません</td></tr>';
        return;
    }

    tbody.innerHTML = parts.map(part => {
        const status = getStockStatus(part);
        const isSelected = selectedPartId === part.id;
        return `
            <tr data-part-id="${part.id}"
                onclick="selectPart('${part.id}')"
                style="cursor: pointer; ${isSelected ? 'background: #e7f3ff;' : ''}"
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='${isSelected ? '#e7f3ff' : 'white'}'">
                <td>${escapeHtml(part.name)}</td>
                <td>${part.current_stock}</td>
                <td>${escapeHtml(part.unit || '個')}</td>
                <td>${part.min_stock}</td>
                <td>${part.reorder_point}</td>
                <td>¥${part.unit_cost.toLocaleString()}</td>
                <td><span class="status-badge status-${status.class}">${status.text}</span></td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 在庫ステータスの判定
// ========================================
function getStockStatus(part) {
    if (part.current_stock <= part.min_stock) {
        return { class: 'danger', text: '不足' };
    } else if (part.current_stock <= part.reorder_point) {
        return { class: 'warning', text: '注意' };
    } else {
        return { class: 'ok', text: '安全' };
    }
}

// ========================================
// HTMLエスケープ
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// 部品追加ボタン
// ========================================
document.getElementById('addPartButton').addEventListener('click', () => {
    openPartModal();
});

// ========================================
// モーダルを開く
// ========================================
function openPartModal(part = null) {
    const modal = document.getElementById('partModal');
    const form = document.getElementById('partForm');
    const title = document.getElementById('partModalTitle');

    // フォームをリセット
    form.reset();
    editingPartId = null;

    if (part) {
        // 編集モード
        title.textContent = '部品編集';
        editingPartId = part.id;

        document.getElementById('partId').value = part.id;
        document.getElementById('partName').value = part.name;
        document.getElementById('partStock').value = part.current_stock;
        document.getElementById('partUnit').value = part.unit || '個';
        document.getElementById('partMinStock').value = part.min_stock;
        document.getElementById('partReorderPoint').value = part.reorder_point;
        document.getElementById('partCost').value = part.unit_cost;
        document.getElementById('partDescription').value = part.description || '';
        document.getElementById('partTags').value = part.tags ? part.tags.join(', ') : '';
    } else {
        // 新規作成モード
        title.textContent = '新規部品追加';
    }

    modal.classList.add('active');
}

// ========================================
// モーダルを閉じる
// ========================================
function closePartModal() {
    const modal = document.getElementById('partModal');
    modal.classList.remove('active');
    editingPartId = null;
}

document.getElementById('closePartModal').addEventListener('click', closePartModal);
document.getElementById('cancelPartButton').addEventListener('click', closePartModal);

// モーダル背景クリックで閉じる
document.getElementById('partModal').addEventListener('click', (e) => {
    if (e.target.id === 'partModal') {
        closePartModal();
    }
});

// ========================================
// 部品フォームの送信
// ========================================
document.getElementById('partForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const partData = {
        user_id: currentUser.id,
        name: document.getElementById('partName').value.trim(),
        current_stock: parseFloat(document.getElementById('partStock').value),
        unit: document.getElementById('partUnit').value.trim(),
        min_stock: parseFloat(document.getElementById('partMinStock').value),
        reorder_point: parseFloat(document.getElementById('partReorderPoint').value),
        unit_cost: parseFloat(document.getElementById('partCost').value),
        description: document.getElementById('partDescription').value.trim(),
        tags: document.getElementById('partTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
    };

    try {
        if (editingPartId) {
            // 更新
            const { error } = await supabase
                .from('parts')
                .update(partData)
                .eq('id', editingPartId);

            if (error) throw error;

            alert('部品を更新しました');
        } else {
            // 新規作成
            const { error } = await supabase
                .from('parts')
                .insert([partData]);

            if (error) throw error;

            alert('部品を追加しました');
        }

        closePartModal();
        await loadPartsData();
        await loadDashboardData();

    } catch (error) {
        console.error('部品保存エラー:', error);
        alert(`部品の保存に失敗しました: ${error.message}`);
    }
});

// ========================================
// 部品編集
// ========================================
async function editPart(partId) {
    const part = partsData.find(p => p.id === partId);
    if (part) {
        openPartModal(part);
    }
}

// ========================================
// 部品削除
// ========================================
async function deletePart(partId) {
    const part = partsData.find(p => p.id === partId);
    if (!part) return;

    if (!confirm(`「${part.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('parts')
            .delete()
            .eq('id', partId);

        if (error) throw error;

        alert('部品を削除しました');
        await loadPartsData();
        await loadDashboardData();

    } catch (error) {
        console.error('部品削除エラー:', error);
        alert(`部品の削除に失敗しました: ${error.message}`);
    }
}

// ========================================
// 検索機能
// ========================================
document.getElementById('partsSearchButton').addEventListener('click', () => {
    const searchTerm = document.getElementById('partsSearchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        renderPartsTable(partsData);
        return;
    }

    const filteredParts = partsData.filter(part =>
        part.name.toLowerCase().includes(searchTerm) ||
        (part.description && part.description.toLowerCase().includes(searchTerm)) ||
        (part.tags && part.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );

    renderPartsTable(filteredParts);
});

// Enterキーで検索
document.getElementById('partsSearchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('partsSearchButton').click();
    }
});

// ========================================
// 部品を選択して詳細を表示
// ========================================
async function selectPart(partId) {
    selectedPartId = partId;
    renderPartsTable(partsData);

    // 部品情報を取得
    const part = partsData.find(p => p.id === partId);
    if (!part) return;

    // 購入先を取得
    try {
        const { data: suppliers, error } = await supabase
            .from('part_suppliers')
            .select('*')
            .eq('part_id', partId)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        selectedPartSuppliers = suppliers || [];
        renderPartDetail(part);

    } catch (error) {
        console.error('購入先取得エラー:', error);
        selectedPartSuppliers = [];
        renderPartDetail(part);
    }
}

// ========================================
// 部品詳細パネルのレンダリング
// ========================================
function renderPartDetail(part) {
    const detailPanel = document.getElementById('partDetailPanel');
    const detailContent = document.getElementById('partDetailContent');

    if (!part) {
        detailPanel.style.display = 'none';
        return;
    }

    const status = getStockStatus(part);

    detailContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
            <div>
                <h3 style="margin: 0 0 0.5rem 0;">${escapeHtml(part.name)}</h3>
                <span class="status-badge status-${status.class}">${status.text}</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="editPart('${part.id}')">✏️ 編集</button>
                <button class="btn btn-danger" onclick="deletePart('${part.id}')">🗑️ 削除</button>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <strong>現在在庫:</strong> ${part.current_stock} ${escapeHtml(part.unit || '個')}
            </div>
            <div>
                <strong>最小在庫:</strong> ${part.min_stock} ${escapeHtml(part.unit || '個')}
            </div>
            <div>
                <strong>発注点:</strong> ${part.reorder_point} ${escapeHtml(part.unit || '個')}
            </div>
            <div>
                <strong>単価:</strong> ¥${part.unit_cost.toLocaleString()}
            </div>
        </div>

        ${part.description ? `
            <div style="margin-bottom: 1.5rem;">
                <strong>説明:</strong><br>
                <p style="margin: 0.5rem 0; color: #666;">${escapeHtml(part.description)}</p>
            </div>
        ` : ''}

        <div style="border-top: 1px solid #eee; padding-top: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0;">購入先情報</h4>
                <button class="btn btn-sm btn-primary" onclick="addSupplier('${part.id}')">+ 購入先追加</button>
            </div>
            <div id="suppliersList">
                ${renderSuppliersList()}
            </div>
        </div>
    `;

    detailPanel.style.display = 'block';
}

// ========================================
// 購入先リストのレンダリング
// ========================================
function renderSuppliersList() {
    if (selectedPartSuppliers.length === 0) {
        return '<p style="color: #999; font-style: italic;">購入先が登録されていません</p>';
    }

    return selectedPartSuppliers.map(supplier => `
        <div style="background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">${escapeHtml(supplier.supplier_name)}</div>
                    ${supplier.url ? `<div style="margin-bottom: 0.5rem;">
                        <a href="${escapeHtml(supplier.url)}" target="_blank" style="color: #667eea; text-decoration: none;">
                            🔗 ${escapeHtml(supplier.url)}
                        </a>
                    </div>` : ''}
                    ${supplier.price > 0 ? `<div style="color: #666;">価格: ¥${supplier.price.toLocaleString()}</div>` : ''}
                    ${supplier.notes ? `<div style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">${escapeHtml(supplier.notes)}</div>` : ''}
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')">削除</button>
            </div>
        </div>
    `).join('');
}

// ========================================
// 購入先追加モーダルを開く
// ========================================
function addSupplier(partId) {
    document.getElementById('supplierPartId').value = partId;
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierModal').style.display = 'block';
}

// ========================================
// 購入先追加モーダルを閉じる
// ========================================
function closeSupplierModal() {
    document.getElementById('supplierModal').style.display = 'none';
}

// ========================================
// 購入先を保存
// ========================================
async function saveSupplier(event) {
    event.preventDefault();

    const partId = document.getElementById('supplierPartId').value;
    const supplierName = document.getElementById('supplierName').value.trim();
    const supplierUrl = document.getElementById('supplierUrl').value.trim();
    const supplierPrice = parseFloat(document.getElementById('supplierPrice').value) || 0;
    const supplierNotes = document.getElementById('supplierNotes').value.trim();

    try {
        const { error } = await supabase
            .from('part_suppliers')
            .insert([{
                user_id: currentUser.id,
                part_id: partId,
                supplier_name: supplierName,
                url: supplierUrl || null,
                price: supplierPrice,
                notes: supplierNotes || null
            }]);

        if (error) throw error;

        alert('購入先を追加しました');
        closeSupplierModal();
        await selectPart(partId); // 詳細を再読み込み

    } catch (error) {
        console.error('購入先追加エラー:', error);
        alert('購入先の追加に失敗しました: ' + error.message);
    }
}

// ========================================
// 購入先を削除
// ========================================
async function deleteSupplier(supplierId) {
    if (!confirm('この購入先を削除しますか？')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('part_suppliers')
            .delete()
            .eq('id', supplierId);

        if (error) throw error;

        alert('購入先を削除しました');
        await selectPart(selectedPartId); // 詳細を再読み込み

    } catch (error) {
        console.error('購入先削除エラー:', error);
        alert('購入先の削除に失敗しました: ' + error.message);
    }
}

// ========================================
// グローバルスコープに関数を公開
// ========================================
window.loadPartsData = loadPartsData;
window.editPart = editPart;
window.deletePart = deletePart;
window.selectPart = selectPart;
window.addSupplier = addSupplier;
window.closeSupplierModal = closeSupplierModal;
window.saveSupplier = saveSupplier;
window.deleteSupplier = deleteSupplier;
