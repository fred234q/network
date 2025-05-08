document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').addEventListener('submit', event => new_post(event));

    load_posts('all');
});

function new_post(event) {

    // Prevent reloading the page
    event.preventDefault();

    // Retrieve contents of post
    const body = document.querySelector('#new-post-body').value;

    // Post post to API
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
        }

        // Clear textarea
        document.querySelector('#new-post-body').value = '';

        // Reload posts
        load_posts('all');

    })
    .catch(error => {
        console.log('Error: ', error);
    });
}

function load_posts(feed) {

    // Clear posts
    document.querySelector('#posts-container').innerHTML = '';

    // Load posts contained in selected feed
  fetch(`/posts/${feed}`)
  .then(response => response.json())
  .then(posts => {
      // Print emails
      console.log(posts);
      posts.forEach(function(post) {
        // Create post card
        const postCard = document.createElement('div');
        postCard.className = 'nm';


        const user = document.createElement('h4');
        user.innerText = post['user'];

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