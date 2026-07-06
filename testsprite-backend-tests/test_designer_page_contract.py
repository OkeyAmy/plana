import requests

BASE_URL = "https://plana-fl0t.onrender.com"


def test_designer_page_contract():
    response = requests.get(BASE_URL + "/fixed", timeout=30)
    assert response.status_code == 200  # blindfold: contract — fixed designer route should serve the workspace page
    body = response.text
    assert "Room Designer" in body  # blindfold: source — src/app/(plana)/fixed/page.tsx workspace strip
    assert "Plana · AI Floor Plan Generator" in body  # blindfold: source — src/app/(plana)/fixed/page.tsx workspace title
    assert "No layout yet" in body  # blindfold: source — src/app/(plana)/fixed/page.tsx canvas empty state
