param([string]$command)

switch ($command) {
    "up" {
        docker compose up --build
    }
    "down" {
        docker compose down
    }
    "build" {
        docker compose build
    }
    "logs" {
        docker compose logs -f
    }
    "restart" {
        docker compose down
        docker compose up --build
    }
    "status" {
        docker ps
    }
    "clean" {
        Write-Host "This will remove unused images, networks, and dangling volumes."
        docker system prune -f
    }
    Default {
        Write-Host "Usage: ./make.ps1 [command]"
        Write-Host "`nAvailable commands:"
        Write-Host "  up       -> Build and run containers"
        Write-Host "  down     -> Stop and remove containers"
        Write-Host "  build    -> Build/rebuild images"
        Write-Host "  logs     -> Show container logs"
        Write-Host "  restart  -> Restart containers fresh"
        Write-Host "  status   -> Show running containers"
        Write-Host "  clean    -> Prune unused Docker resources"
    }
}