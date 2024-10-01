document.addEventListener("DOMContentLoaded", () => {
  const commentInput = document.getElementById("comment-input");
  const sendButton = document.querySelector(".comments-container__send-btn");
  const commentBox = document.querySelector(".comments-container__box");

  sendButton.addEventListener("click", function () {
    const commentText = commentInput.value.trim();
    const commenterName = "کاربر ناشناس";
    const commenterImage = "https://via.placeholder.com/40";
    const currentDateTime = new Date().toLocaleString();

    if (commentText === "") {
      alert("متن کامنت نمی‌تواند خالی باشد!");
      return;
    }

    const newComment = document.createElement("div");
    newComment.classList.add("comment");
    newComment.innerHTML = `
      <div class="comment__header">
        <img src="${commenterImage}" alt="${commenterName}" class="comment__avatar" />
        <div class="comment__info">
          <p class="comment__name">${commenterName}</p>
          <p class="comment__time">${currentDateTime}</p>
        </div>
      </div>
      <p class="comment__text">${commentText}</p>
      <div class="comment__actions">
        <i class="fas fa-thumbs-up comment__like-btn"></i>
        <i class="fas fa-reply comment__reply-btn"></i>
        <i class="fas fa-edit comment__edit-btn"></i>
        <i class="fas fa-trash comment__delete-btn"></i>
      </div>
      <div class="reply-list"></div>
    `;

    commentBox.prepend(newComment);
    commentInput.value = "";

    setupCommentActions(newComment);
  });

  function setupCommentActions(commentElement) {
    const likeButton = commentElement.querySelector(".comment__like-btn");
    const deleteButton = commentElement.querySelector(".comment__delete-btn");
    const editButton = commentElement.querySelector(".comment__edit-btn");
    const replyButton = commentElement.querySelector(".comment__reply-btn");
    const commentTextElement = commentElement.querySelector(".comment__text");
    const replyList = commentElement.querySelector(".reply-list");

    likeButton.addEventListener("click", function () {
      likeButton.classList.toggle("liked");
    });

    deleteButton.addEventListener("click", function () {
      commentElement.remove();
    });

    editButton.addEventListener("click", function () {
      handleEditComment(editButton, commentTextElement);
    });

    replyButton.addEventListener("click", function () {
      const replyInput = document.createElement("div");
      replyInput.classList.add("reply-input");
      replyInput.innerHTML = `
        <input type="text" placeholder="متن پاسخ را وارد کنید..." />
        <button class="send-reply-btn">ارسال</button>
        <button class="cancel-reply-btn">لغو</button>
      `;
      commentElement.append(replyInput);

      const sendReplyBtn = replyInput.querySelector(".send-reply-btn");
      const cancelReplyBtn = replyInput.querySelector(".cancel-reply-btn");

      sendReplyBtn.addEventListener("click", function () {
        const replyText = replyInput.querySelector("input").value.trim();
        const replierName = "کاربر ناشناس";
        const replierImage = "https://via.placeholder.com/40";
        const currentReplyDateTime = new Date().toLocaleString();

        if (replyText) {
          const replyDiv = document.createElement("div");
          replyDiv.classList.add("reply");
          replyDiv.innerHTML = `
            <div class="comment__header">
              <img src="${replierImage}" alt="${replierName}" class="comment__avatar" />
              <div class="comment__info">
                <p class="comment__name">${replierName}</p>
                <p class="comment__time">${currentReplyDateTime}</p>
              </div>
            </div>
            <p class="reply__text">${replyText}</p>
            <div class="comment__actions">
              <i class="fas fa-thumbs-up comment__like-btn"></i>
              <i class="fas fa-reply comment__reply-btn"></i>
              <i class="fas fa-edit comment__edit-btn"></i>
              <i class="fas fa-trash comment__delete-btn"></i>
            </div>
            <div class="reply-list"></div>
          `;
          replyList.append(replyDiv);
          setupCommentActions(replyDiv);

          if (!commentElement.querySelector("details")) {
            const details = document.createElement("details");
            details.classList.add("reply-container");
            details.innerHTML = `<summary>پاسخ‌ها</summary>`;
            details.append(replyList);
            commentElement.append(details);
          }
          replyInput.remove();
        }
      });

      cancelReplyBtn.addEventListener("click", function () {
        replyInput.remove();
      });
    });

    replyList.addEventListener("click", (e) => {
      if (e.target.classList.contains("comment__delete-btn")) {
        const replyDiv = e.target.closest(".reply");
        replyDiv.remove();

        if (!replyList.querySelector(".reply")) {
          const details = commentElement.querySelector("details");
          if (details) {
            details.remove();
          }
        }
      }
    });

    replyList.addEventListener("click", (e) => {
      if (e.target.classList.contains("comment__edit-btn")) {
        const replyDiv = e.target.closest(".reply");
        const replyTextElement = replyDiv.querySelector(".reply__text");
        const editButton = e.target;
        handleEditComment(editButton, replyTextElement);
      }
    });
  }

  function handleEditComment(editButton, textElement) {
    const isEditing = editButton.classList.contains("editing");

    if (isEditing) {
      const updatedText = textElement.querySelector("input").value.trim();
      if (updatedText) {
        textElement.innerHTML = updatedText;
      } else {
        textElement.innerHTML = "متن قبلی را وارد کنید!";
      }
      editButton.classList.remove("editing");
      editButton.classList.replace("fa-save", "fa-edit");
    } else {
      const currentText = textElement.textContent.trim();
      textElement.innerHTML = `<input type="text" value="${currentText}" class="comment__edit-input"/>`;
      editButton.classList.add("editing");
      editButton.classList.replace("fa-edit", "fa-save");
    }
  }
});
