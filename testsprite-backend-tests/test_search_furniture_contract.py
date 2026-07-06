import requests

BASE_URL = "https://plana-fl0t.onrender.com"


def test_search_furniture_requires_type():
    response = requests.post(BASE_URL + "/api/search-furniture", json={}, timeout=30)
    assert response.status_code == 400  # blindfold: contract — missing required furnitureType must be a client error
    assert response.json() == {"products": []}  # blindfold: source — src/app/api/search-furniture/route.ts missing furnitureType branch


def test_search_furniture_returns_products_array_shape():
    response = requests.post(BASE_URL + "/api/search-furniture", json={"furnitureType": "sofa"}, timeout=30)
    assert response.status_code == 200  # blindfold: contract — valid furniture search request returns a successful JSON response
    data = response.json()
    assert "products" in data  # blindfold: contract — API response schema always includes products list for valid furnitureType
    assert isinstance(data["products"], list)
