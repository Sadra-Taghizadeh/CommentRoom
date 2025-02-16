document.addEventListener("DOMContentLoaded", () => {
  const commentInput = document.getElementById("comment-input");
  const sendButton = document.getElementById("send-btn");
  const commentBox = document.getElementById("comments-box");
  const totalCommentsEl = document.getElementById("total-comments");
  const totalLikesEl = document.getElementById("total-likes");
  const emojiTrigger = document.getElementById("emoji-trigger");
  const emojiPickerContainer = document.getElementById(
    "emoji-picker-container"
  );
  const emojiPicker = document.querySelector("emoji-picker");

  let totalComments = 0;
  let totalLikes = 0;

  // Load comments from localStorage
  loadComments();
  updateStats();

  // Event Listeners
  sendButton.addEventListener("click", submitComment);
  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitComment();
  });

  if (emojiPicker) {
    emojiPicker.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      commentInput.value += emoji;
      commentInput.focus();
    });
  }

  emojiTrigger.addEventListener("click", () => {
    emojiPickerContainer.classList.toggle("show");
  });

  // Functions
  function submitComment() {
    const commentText = commentInput.value.trim();
    if (!commentText) {
      showNotification("لطفاً متن نظر را وارد کنید", "error");
      return;
    }

    const newComment = createComment(
      "کاربر ناشناس",
      "https://via.placeholder.com/48",
      new Date().toLocaleString("fa-IR"),
      commentText
    );

    const emptyState = commentBox.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    commentBox.insertBefore(newComment, commentBox.firstChild);
    commentInput.value = "";
    totalComments++;
    updateStats();
    saveComments();
    setupCommentActions(newComment);
    showNotification("نظر شما با موفقیت ثبت شد", "success");

    emojiPickerContainer.classList.remove("show");
  }

  function createComment(name, image, time, text) {
    const newComment = document.createElement("div");
    newComment.classList.add("comment");
    newComment.innerHTML = `
        <div class="comment__header">
            <img src="${image}" alt="${name}" class="comment__avatar" />
            <div class="comment__info">
                <p class="comment__name">${name}</p>
                <p class="comment__time">
                    <i class="far fa-clock"></i>
                    ${time}
                </p>
            </div>
        </div>
        <p class="comment__text">${text}</p>
        <div class="comment__actions">
            <button class="comment__action-btn comment__like-btn">
                <i class="far fa-heart"></i>
                <span>پسندیدن</span>
            </button>
            <button class="comment__action-btn comment__reply-btn">
                <i class="far fa-comment"></i>
                <span>پاسخ</span>
            </button>
            <button class="comment__action-btn comment__edit-btn">
                <i class="far fa-edit"></i>
                <span>ویرایش</span>
            </button>
            <button class="comment__action-btn comment__delete-btn">
                <i class="far fa-trash-alt"></i>
                <span>حذف</span>
            </button>
        </div>
        <div class="comment__replies" style="display: none;"></div>
        <button class="comment__toggle-replies-btn">
            <i class="fas fa-chevron-down"></i>
            <span>نمایش پاسخ‌ها</span>
        </button>
    `;
    return newComment;
  }

  function setupCommentActions(commentElement) {
    const likeButton = commentElement.querySelector(".comment__like-btn");
    const deleteButton = commentElement.querySelector(".comment__delete-btn");
    const editButton = commentElement.querySelector(".comment__edit-btn");
    const replyButton = commentElement.querySelector(".comment__reply-btn");
    const toggleRepliesButton = commentElement.querySelector(
      ".comment__toggle-replies-btn"
    );
    const repliesContainer = commentElement.querySelector(".comment__replies");

    // نمایش/مخفی کردن پاسخ‌ها
    if (toggleRepliesButton && repliesContainer) {
      toggleRepliesButton.addEventListener("click", function () {
        const isHidden = repliesContainer.style.display === "none";
        repliesContainer.style.display = isHidden ? "block" : "none";
        this.classList.toggle("active");
        this.querySelector("span").textContent = isHidden
          ? "مخفی کردن پاسخ‌ها"
          : "نمایش پاسخ‌ها";
      });
    }

    likeButton.addEventListener("click", function () {
      const isLiked = this.classList.toggle("liked");
      const icon = this.querySelector("i");
      if (isLiked) {
        icon.classList.replace("far", "fas");
        totalLikes++;
      } else {
        icon.classList.replace("fas", "far");
        totalLikes--;
      }
      updateStats();
      saveComments();
    });

    function showConfirmDialog(message) {
      return new Promise((resolve) => {
        const confirmDialog = document.getElementById("confirm-dialog");
        const confirmDialogMessage = document.getElementById(
          "confirm-dialog-message"
        );
        const confirmDialogYes = document.getElementById("confirm-dialog-yes");
        const confirmDialogNo = document.getElementById("confirm-dialog-no");

        confirmDialogMessage.textContent = message;
        confirmDialog.style.display = "flex";

        confirmDialogYes.addEventListener("click", () => {
          confirmDialog.style.display = "none";
          resolve(true);
        });

        confirmDialogNo.addEventListener("click", () => {
          confirmDialog.style.display = "none";
          resolve(false);
        });
      });
    }

    deleteButton.addEventListener("click", async function () {
      const result = await showConfirmDialog("آیا از حذف این نظر مطمئن هستید؟");
      if (result) {
        commentElement.style.opacity = "0";
        setTimeout(() => {
          commentElement.remove();
          totalComments--;
          updateStats();
          saveComments();
          showNotification("نظر با موفقیت حذف شد", "success");
          checkEmptyState(); // بررسی وضعیت empty-state پس از حذف نظر
        }, 300);
      }
    });

    editButton.addEventListener("click", function () {
      handleEditComment(
        editButton,
        commentElement.querySelector(".comment__text")
      );
    });

    replyButton.addEventListener("click", function () {
      const existingReplyInput = commentElement.querySelector(".reply-input");
      if (existingReplyInput) {
        existingReplyInput.remove();
        return;
      }

      const replyInput = document.createElement("div");
      replyInput.classList.add("reply-input");
      replyInput.innerHTML = `
            <input type="text" placeholder="پاسخ خود را وارد کنید..." />
            <button class="btn btn-primary send-reply-btn">
                <i class="fas fa-paper-plane"></i>
                ارسال
            </button>
            <button class="btn btn-danger cancel-reply-btn">
                <i class="fas fa-times"></i>
                لغو
            </button>
        `;

      commentElement.appendChild(replyInput);
      replyInput.querySelector("input").focus();

      setupReplyInputActions(replyInput);
    });
  }

  function setupReplyInputActions(replyInput) {
    const sendReplyBtn = replyInput.querySelector(".send-reply-btn");
    const cancelReplyBtn = replyInput.querySelector(".cancel-reply-btn");
    const input = replyInput.querySelector("input");

    sendReplyBtn.addEventListener("click", function () {
      const replyText = input.value.trim();
      if (replyText) {
        const replyDiv = createComment(
          "کاربر ناشناس",
          "https://via.placeholder.com/48",
          new Date().toLocaleString("fa-IR"),
          replyText
        );

        const repliesContainer =
          replyInput.parentElement.querySelector(".comment__replies");
        repliesContainer.appendChild(replyDiv);

        setupCommentActions(replyDiv);
        replyInput.remove();
        totalComments++;
        updateStats();
        saveComments();
        showNotification("پاسخ شما با موفقیت ثبت شد", "success");
      }
    });

    cancelReplyBtn.addEventListener("click", function () {
      replyInput.remove();
    });

    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendReplyBtn.click();
      }
    });
  }

  function handleEditComment(editButton, textElement) {
    const isEditing = editButton.classList.contains("editing");

    if (isEditing) {
      const textarea = textElement.querySelector("textarea");
      const updatedText = textarea.value.trim();
      if (updatedText) {
        textElement.innerHTML = updatedText;
        showNotification("نظر با موفقیت ویرایش شد", "success");
      }
      editButton.classList.remove("editing");
      editButton.querySelector("i").classList.replace("fa-save", "fa-edit");
      editButton.querySelector("span").textContent = "ویرایش";
    } else {
      const currentText = textElement.textContent.trim();
      textElement.innerHTML = `<textarea class="comment__edit-input">${currentText}</textarea>`;
      const textarea = textElement.querySelector("textarea");

      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = `${this.scrollHeight}px`;
      });

      editButton.classList.add("editing");
      editButton.querySelector("i").classList.replace("fa-edit", "fa-save");
      editButton.querySelector("span").textContent = "ذخیره";
    }
    saveComments();
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <span>${message}</span>
        `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function updateStats() {
    totalCommentsEl.textContent = totalComments;
    totalLikesEl.textContent = totalLikes;
    checkEmptyState(); // بررسی وضعیت empty-state پس از به‌روزرسانی آمار
  }
  function checkEmptyState() {
    const comments = commentBox.querySelectorAll(".comment");
    const existingEmptyState = commentBox.querySelector(".empty-state"); // بررسی وجود empty-state قبلی

    if (comments.length === 0 && !existingEmptyState) {
      const emptyState = document.createElement("div");
      emptyState.classList.add("empty-state");
      emptyState.innerHTML = `
      <i class="far fa-comments"></i>
      <p>هنوز نظری ثبت نشده است</p>
      <span>اولین نفری باشید که نظر می‌دهید!</span>
    `;
      commentBox.appendChild(emptyState);
    } else if (comments.length > 0 && existingEmptyState) {
      existingEmptyState.remove(); // اگر نظری وجود دارد و empty-state نمایش داده می‌شود، آن را حذف کنید
    }
  }
  function saveComments() {
    const comments = commentBox.innerHTML;
    localStorage.setItem("comments", comments);
    localStorage.setItem(
      "stats",
      JSON.stringify({ totalComments, totalLikes })
    );
  }

  function loadComments() {
    const comments = localStorage.getItem("comments");
    const stats = JSON.parse(localStorage.getItem("stats") || "{}");

    if (comments) {
      commentBox.innerHTML = comments;
      totalComments = stats.totalComments || 0;
      totalLikes = stats.totalLikes || 0;
      document.querySelectorAll(".comment").forEach((comment) => {
        setupCommentActions(comment);
      });
    }
    checkEmptyState(); // بررسی وضعیت empty-state پس از بارگذاری نظرات
  }
});
