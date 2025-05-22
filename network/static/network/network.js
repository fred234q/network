document.addEventListener('DOMContentLoaded', function() {

    feed = document.querySelector('#posts-container').dataset.feed;

    // If no feed, make the feed 'all'
    if (!feed) {
        feed = 'all';
        // Posting only possible if showing all posts
        if (document.querySelector('#new-post-form')) {
            document.querySelector('#new-post-form').addEventListener('submit', event => new_post(event));
        }
    } else if (feed != 'following') {
        load_user(feed)
    }

    // Follow button
    if (document.querySelector('#follow-btn')) {
        document.querySelector('#follow-btn').addEventListener('click', () => follow(feed));
    }

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => edit(event));
    })
});

function new_post(event) {

    // Prevent reloading the page
    event.preventDefault();

    // Retrieve contents of post
    const body = document.querySelector('#new-post-body').value;

    // Post new post to API
    fetch('/new-post', {
        method: 'POST',
        body: JSON.stringify({
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        // Remove existing alert
        if (document.querySelector('.alert')) {
            document.querySelector('.alert').remove();
        }

        // Create alert
        const alert = document.createElement('div');
        alert.classList.add('alert', 'nm');
        document.querySelector('#new-post').append(alert);

        // Change color and content based on the type of alert
        if (result.error) {
            alert.classList.add('alert-danger');
            alert.innerText = `Error: ${result.error}`;
        } else {
            alert.classList.add('alert-success');
            alert.innerText = result.message;

            // Reload posts
            load_posts('all');
        }

        // Clear textarea
        document.querySelector('#new-post-body').value = '';
    })
    .catch(error => {
        console.log('Error: ', error);
    });
}

function load_posts(feed) {


  // Reload page
  location.reload()

  // Clear posts
  document.querySelector('#posts-container').innerHTML = '';

  // Load posts contained in selected feed
  fetch(`/posts/${feed}`)
  .then(response => response.json())
  .then(posts => {
      // Print emails
      console.log(posts);
      if (posts.error) {
        return;
      }
      posts.forEach(function(post) {
        // Create post card
        const postCard = document.createElement('div');
        postCard.className = 'nm';


        const user = document.createElement('h4');
        const userLink = document.createElement('a');
        userLink.href = `/user/${post['user']}`;
        userLink.innerText = post['user'];
        user.append(userLink);
        // user.innerText = post['user'];

        const body = document.createElement('p');
        body.innerText = post['body'];

        const timestamp = document.createElement('p');
        timestamp.innerText = post['timestamp'];

        const likes = document.createElement('p');
        likes.innerText = post['likes'];
        const heart = document.createElement('i');
        heart.classList.add('fa-regular', 'fa-heart');
        likes.prepend(heart);

        postCard.append(user, body, timestamp, likes);

        document.querySelector('#posts-container').append(postCard);

      });
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function load_user(feed) {

  // Load user
  fetch(`/user/${feed}/info`)
  .then(response => response.json())
  .then(user => {
      // Print user
      console.log(user);
      if (user.error) {
        return;
      }

      // Set posts, followers and following for user
      const posts = document.querySelector('#user-posts').lastElementChild;
      const followers = document.querySelector('#user-followers').lastElementChild;
      const following = document.querySelector('#user-following').lastElementChild;

      posts.innerText = user.posts;
      followers.innerText = user.followers;
      following.innerText = user.following;

  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function follow(user) {
    fetch(`/user/${user}/follow`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)

        // Update follow button text
        const followBtn = document.querySelector('#follow-btn');
        if (!result.error) {
            if (followBtn.innerText == 'Follow') {
                followBtn.innerText = 'Unfollow';
            } else {
                followBtn.innerText = 'Follow';
            }

            // Update followers count
            load_user(feed);
        }
    })
    .catch(error => {
        console.log('Error:', error);
    });
}

function edit(event) {
    event.preventDefault();
    
    // Get post id
    const postId = event.target.parentElement.dataset.postId;
    const oldBody = event.target.nextElementSibling;

    // Create form for the edit
    const editDiv = document.createElement('div');

    // Textarea
    const editArea = document.createElement('textarea');
    editArea.className = 'nm-inset';
    editArea.value = oldBody.innerText;

    // Button
    const editSaveBtn = document.createElement('button');
    editSaveBtn.className = 'button';
    editSaveBtn.innerText = 'Save';
    editSaveBtn.addEventListener('click', () => {
        const body = editArea.value;

        fetch(`/posts/${postId}/edit`, {
            method: 'PUT',
            body: JSON.stringify({
                body: body
            })
        })
        .then(result => {
            // Print result
            console.log(result);
            load_posts(feed);
        })
        .catch(error => {
            console.log('Error:', error);
        });
    })

    editDiv.append(editArea, editSaveBtn);

    oldBody.replaceWith(editDiv);
}