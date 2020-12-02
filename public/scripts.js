/* Current Page */
const currentPage = location.pathname;
const menuItems = document.querySelectorAll(".menu-link");

for (item of menuItems) {
  if (currentPage.includes(item.getAttribute("href"))) {
    item.classList.add("active");
  }
}

/* Header Position */
const header = document.querySelector("header");
let appended = false;

onscroll = () => {
  let scroll = document.documentElement.scrollTop || document.body.scrollTop;

  appended = scroll;

  if (scroll > 2) {
    header.classList.add("header-over");
  } else {
    header.classList.remove("header-over");
  }
};

/* Masks */
const Mask = {
  apply(input, func) {
    setTimeout(function () {
      input.value = Mask[func](input.value);
    }, 0);
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "");

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  },
  formatPercent(value) {
    value = value.replace(/\D/g, "");

    value = value * 0.01;

    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value * 0.01);
  },
  formatCPF(value) {
    value = value.replace(/\D/g, "");

    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },
};

/* Pagination */
function paginate(selectedPage, totalPages) {
  let pages = [],
    oldPage;

  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    const firstAndLastPage = currentPage == 1 || currentPage == totalPages;
    const pagesAfterSelectedPage = currentPage <= selectedPage + 2;
    const pagesBeforeSelectedPage = currentPage >= selectedPage - 2;

    if (
      firstAndLastPage ||
      (pagesBeforeSelectedPage && pagesAfterSelectedPage)
    ) {
      if (oldPage && currentPage - oldPage > 2) {
        pages.push("...");
      }

      if (oldPage && currentPage - oldPage == 2) {
        pages.push(oldPage + 1);
      }

      pages.push(currentPage);

      oldPage = currentPage;
    }
  }
  return pages;
}

function createPagination(pagination) {
  const filter = pagination.dataset.filter;
  const page = +pagination.dataset.page;
  const total = +pagination.dataset.total;

  const pages = paginate(page, total);

  let elements = "";

  for (let page of pages) {
    if (String(page).includes("...")) {
      elements += `<span href="?page=${page}">${page}</span>`;
    } else {
      if (filter) {
        elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`;
      } else {
        elements += `<a href="?page=${page}">${page}</a>`;
      }
    }
  }

  pagination.innerHTML = elements;
}

const pagination = document.querySelector(".pagination");

if (pagination) {
  createPagination(pagination);

  const currentPage = pagination.dataset.page;
  const paginationList = document.querySelectorAll(".pagination a");

  for (item of paginationList) {
    if (currentPage == item.innerText) {
      item.classList.add("page-active");
    }
  }
}

/* Photos Upload */
const PhotosUpload = {
  input: "",
  preview: document.querySelector("#photos-preview"),
  uploadLimit: 5,
  files: [],
  handleFileInput(event) {
    const { files: fileList } = event.target;
    PhotosUpload.input = event.target;

    if (PhotosUpload.hasLimit(event)) return;

    Array.from(fileList).forEach((file) => {
      PhotosUpload.files.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();
        image.src = String(reader.result);

        const div = PhotosUpload.getContainer(image);
        PhotosUpload.preview.appendChild(div);
      };

      reader.readAsDataURL(file);
    });

    PhotosUpload.input.files = PhotosUpload.getAllFiles();
  },
  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload;

    const { files: fileList } = input;

    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }

    const photosDiv = [];

    preview.childNodes.forEach((item) => {
      if (item.classList && item.classList.value == "photo")
        photosDiv.push(item);
    });

    const totalPhotos = fileList.length + photosDiv.length;

    if (totalPhotos > uploadLimit) {
      alert("Você atingiu o limite máximo de fotos");
      event.preventDefault();
      return true;
    }

    return false;
  },
  getAllFiles() {
    const dataTransfer =
      new ClipboardEvent("").clipboardData || new DataTransfer();

    PhotosUpload.files.forEach((file) => dataTransfer.items.add(file));

    return dataTransfer.files;
  },
  getContainer(image) {
    const div = document.createElement("div");

    div.classList.add("photo");

    div.onclick = PhotosUpload.removePhoto;

    div.appendChild(image);

    div.appendChild(PhotosUpload.getRemoveButton());

    return div;
  },
  getRemoveButton() {
    const button = document.createElement("i");

    button.classList.add("material-icons");
    button.innerHTML = "close";

    return button;
  },
  removePhoto(event) {
    const photoDiv = event.target.parentNode; // <div class="photo">
    const photosArray = Array.from(PhotosUpload.preview.children);
    const index = photosArray.indexOf(photoDiv);

    PhotosUpload.files.splice(index, 1);
    PhotosUpload.input.files = PhotosUpload.getAllFiles();

    photoDiv.remove();
  },
  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode;

    if (photoDiv.id) {
      const removedFiles = document.querySelector(
        'input[name="removed_files"]'
      );

      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`;
      }
    }

    photoDiv.remove();
  },
};

const ImageGallery = {
  highlight: document.querySelector(".gallery .highlight > img"),
  previews: document.querySelectorAll(".gallery-preview img"),
  setImage(event) {
    const { target } = event;

    ImageGallery.previews.forEach((preview) =>
      preview.classList.remove("active")
    );

    target.classList.add("active");

    ImageGallery.highlight.src = target.src;
    Lightbox.image.src = target.src;
  },
};

const Lightbox = {
  target: document.querySelector(".lightbox-target"),
  image: document.querySelector(".lightbox-target img"),
  closeButton: document.querySelector(".lightbox-target a.lightbox-close"),
  open() {
    Lightbox.target.style.opacity = 1;
    Lightbox.target.style.top = 0;
    Lightbox.target.style.button = 0;
    Lightbox.closeButton.style.top = 0;
  },
  close() {
    Lightbox.target.style.opacity = 0;
    Lightbox.target.style.top = "-100%";
    Lightbox.target.style.button = "initial";
    Lightbox.closeButton.style.top = "-80px";
  },
};

/* Barra de status de leitura */
const scrollIndicator = document.querySelector(".scrollIndicator");

if (scrollIndicator) {
  let bar = document.createElement("div");

  bar.style.height = "4px";
  bar.style.width = "0";
  bar.style.backgroundColor = "#6633cc";
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.zIndex = "9999";
  bar.style.transition = "0.2s";

  document.body.append(bar);

  const maxHeight = window.document.body.scrollHeight - window.innerHeight;

  function updateBar() {
    const position = (window.scrollY / maxHeight) * 100;

    bar.style.width = position + "%";
  }

  window.addEventListener("load", () => {
    document.addEventListener("scroll", updateBar);
  });
}
