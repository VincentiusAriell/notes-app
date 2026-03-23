document.addEventListener('DOMContentLoaded', function () {
    fetch('http://35.239.128.73:3000/api/notes')
    .then(res => res.json())
    .then(data => loadHTMLTable(data.notes))
    .catch(err => console.log(err));
});

document.querySelector('tbody').addEventListener('click', function(event) {
    if (event.target.classList.contains("delete-row-btn")) deleteRowById(event.target.dataset.id);
    if (event.target.classList.contains("edit-row-btn")) handleEditRow(event.target.dataset.id);
});

document.querySelector('#search-btn').onclick = function() {
    const value = document.querySelector('#search-input').value.toLowerCase();
    fetch('http://35.239.128.73:3000/api/notes')
    .then(res => res.json())
    .then(data => {
        const filtered = data.notes.filter(note => note.judul.toLowerCase().includes(value));
        loadHTMLTable(filtered);
    })
    .catch(err => console.log(err));
};

document.querySelector('#add-note-btn').onclick = function () {
    const judul = document.querySelector('#judul-input').value;
    const isi = document.querySelector('#note-input').value;
    if (!judul || !isi) return alert("Judul dan isi harus diisi");
    fetch('http://35.239.128.73:3000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi })
    })
    .then(res => res.json())
    .then(() => location.reload())
    .catch(err => console.log(err));
};

document.querySelector('#update-row-btn').onclick = function() {
    const section = document.querySelector('#update-row');
    const id = section.dataset.id;
    const judul = document.querySelector('#update-judul-input').value;
    const isi = document.querySelector('#update-note-input').value;
    if (!judul || !isi) return alert("Judul dan isi harus diisi");
    fetch('http://35.239.128.73:3000/api/notes/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi })
    })
    .then(res => res.json())
    .then(data => { if(data.success) location.reload(); else alert(data.message); })
    .catch(err => console.log(err));
};

function deleteRowById(id) {
    fetch('http://35.239.128.73:3000/api/notes/' + id, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => { if(data.success) location.reload(); else alert("Gagal menghapus catatan"); })
    .catch(err => console.log(err));
}

function handleEditRow(id) {
    const section = document.querySelector('#update-row');
    section.hidden = false;
    section.dataset.id = id;
    const row = Array.from(document.querySelectorAll('tbody tr')).find(tr => tr.children[0].innerText == id);
    document.querySelector('#update-judul-input').value = row.children[1].innerText;
    document.querySelector('#update-note-input').value = row.children[2].innerText;
}

function loadHTMLTable(data) {
    const table = document.querySelector('tbody');
    if (!data || !data.length) { table.innerHTML = "<tr><td colspan='6'>No Data</td></tr>"; return; }
    let html = "";
    data.forEach(({id, judul, isi, tanggal_dibuat}) => {
        html += `
        <tr>
            <td>${id}</td>
            <td>${judul}</td>
            <td>${isi}</td>
            <td>${new Date(tanggal_dibuat).toLocaleString()}</td>
            <td><button class="delete-row-btn" data-id="${id}">Delete</button></td>
            <td><button class="edit-row-btn" data-id="${id}">Edit</button></td>
        </tr>`;
    });
    table.innerHTML = html;
}