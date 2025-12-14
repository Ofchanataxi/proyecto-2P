package ec.edu.espe.msventas.clients;

import ec.edu.espe.msventas.models.dto.ProductoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-catalogo", url = "${app.clients.catalogo.url}")
public interface CatalogoClient {
    @GetMapping("/{id}")
    ProductoDTO obtenerProducto(@PathVariable Long id);
}