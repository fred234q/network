document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').addEventListener('submit', event => new_post(event));
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

        // Clear textarea
        document.querySelector('#new-post-body').value = ''

    })
    .catch(error => {
        console.log('Error: ', error);
    });
}