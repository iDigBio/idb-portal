document.addEventListener("DOMContentLoaded", function() {
    var headerTitle = document.querySelector('.md-header__button');
    if (headerTitle) {
        headerTitle.innerHTML = '';

        // Create the anchor element
        var link = document.createElement('a');
        link.href = 'https://beta-portal.idigbio.org'; // Set the destination URL

        // Create the image element
        var img = document.createElement('img');
        img.src = 'https://beta-portal.idigbio.org/portal/img/idigbio_logo.png';
        img.alt = 'iDigBio Logo';
        img.style = 'height: 50px; margin-right: 10px;'; // Adjust size and margin as needed

        // Append the image to the anchor element
        link.appendChild(img);

        // Append the anchor element to the header title
        headerTitle.appendChild(link);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
        searchInput.placeholder = 'Search docs';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var title = document.querySelector('.md-ellipsis');
    if (title) {
        title.innerHTML = 'BETA DOCUMENTATION'
        title.style = 'color: red;'
    }
});
