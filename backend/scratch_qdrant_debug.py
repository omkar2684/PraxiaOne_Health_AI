from qdrant_client import QdrantClient
client = QdrantClient(url="http://localhost:6333")
print(f"Client methods: {dir(client)}")
try:
    print(f"Search exists: {hasattr(client, 'search')}")
except Exception as e:
    print(f"Error checking: {e}")
