// Fill header username & initials
(function () {
  var name = localStorage.getItem("userName") || "Group 2";
  var initials = name.trim().split(/\s+/).slice(0, 2)
    .map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
  document.getElementById("user-name").textContent = name;
  document.getElementById("user-initials").textContent = initials;
})();

// Remember which course was clicked (used by training-details.html)
document.querySelectorAll('.details-link').forEach(function (link) {
  link.addEventListener('click', function () {
    localStorage.setItem('selectedCourse', link.dataset.course);
  });
});

// Pagination & Filter Script
let currentPage = 1;

function filterAndPaginate() {
  const workshopChecked = document.getElementById('type-workshop').checked;
  const courseChecked = document.getElementById('type-course').checked;
  const internshipChecked = document.getElementById('type-internship').checked;

  const priceVal = document.querySelector('input[name="price"]:checked').value;
  const cards = document.querySelectorAll('#results .col');

  let visibleCount = 0;

  cards.forEach(card => {
    const type = card.getAttribute('data-type');
    const price = card.getAttribute('data-price');
    const page = parseInt(card.getAttribute('data-page'));

    let matchesType = false;
    if (type === 'workshop' && workshopChecked) matchesType = true;
    if (type === 'course' && courseChecked) matchesType = true;
    if (type === 'internship' && internshipChecked) matchesType = true;

    let matchesPrice = false;
    if (priceVal === 'all') matchesPrice = true;
    else if (priceVal === 'free' && price === 'free') matchesPrice = true;
    else if (priceVal === 'paid' && price === 'paid') matchesPrice = true;

    if (matchesType && matchesPrice) {
      if (page === currentPage) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('result-count').textContent = `${visibleCount} trainings`;
}

document.getElementById('apply-filters').addEventListener('click', function (e) {
  e.preventDefault();
  currentPage = 1;
  updatePaginationUI();
  filterAndPaginate();
});

document.querySelectorAll('#pagination-list .page-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const pageTarget = this.getAttribute('data-page');

    if (pageTarget === 'prev' && currentPage > 1) {
      currentPage--;
    } else if (pageTarget === 'next' && currentPage < 2) {
      currentPage++;
    } else if (!isNaN(pageTarget)) {
      currentPage = parseInt(pageTarget);
    }

    updatePaginationUI();
    filterAndPaginate();
  });
});

function updatePaginationUI() {
  document.getElementById('page-btn-1').className = currentPage === 1 ? 'page-item active' : 'page-item';
  document.getElementById('page-btn-1').querySelector('a').className = currentPage === 1 ? 'page-link bg-dark border-dark text-white' : 'page-link text-dark';

  document.getElementById('page-btn-2').className = currentPage === 2 ? 'page-item active' : 'page-item';
  document.getElementById('page-btn-2').querySelector('a').className = currentPage === 2 ? 'page-link bg-dark border-dark text-white' : 'page-link text-dark';

  document.getElementById('prev-page').className = currentPage === 1 ? 'page-item disabled' : 'page-item';
  document.getElementById('next-page').className = currentPage === 2 ? 'page-item disabled' : 'page-item';
}

filterAndPaginate();