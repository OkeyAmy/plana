# Auto-injected credentials — redacted for security; set TESTSPRITE_AUTH_CREDENTIAL to run this locally
__AUTH_CREDENTIAL__ = __import__("os").environ.get("TESTSPRITE_AUTH_CREDENTIAL", "")
__AUTH_TYPE__ = "public"
__AUTH_HEADERS__ = {}
import requests

BASE_URL = "https://plana-fl0t.onrender.com"


def test_home_page_contract():
    response = requests.get(BASE_URL + "/", timeout=30)
    assert response.status_code == 200  # blindfold: contract — deployed home route should serve the landing page successfully
    body = response.text
    assert "Design your room" in body  # blindfold: source — src/app/(plana)/page.tsx hero headline
    assert "Start designing" in body  # blindfold: source — src/app/(plana)/page.tsx primary CTA
    assert "TestSprite Hackathon S3" in body  # blindfold: source — src/app/(plana)/page.tsx hero badge