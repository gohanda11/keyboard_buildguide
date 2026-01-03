// ========================================
// 部品管理機能
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: 部品のCRUD操作と在庫管理
// ========================================

let partsData = [];
let editingPartId = null;

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
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">部品データがありません</td></tr>';
        return;
    }

    tbody.innerHTML = parts.map(part => {
        const status = getStockStatus(part);
        return `
            <tr data-part-id="${part.id}">
                <td>${escapeHtml(part.name)}</td>
                <td>${part.current_stock}</td>
                <td>${escapeHtml(part.unit || '個')}</td>
                <td>${part.min_stock}</td>
                <td>${part.reorder_point}</td>
                <td>¥${part.unit_cost.toLocaleString()}</td>
                <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editPart('${part.id}')">編集</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePart('${part.id}')">削除</button>
                </td>
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
// グローバルスコープに関数を公開
// ========================================
window.loadPartsData = loadPartsData;
window.editPart = editPart;
window.deletePart = deletePart;
