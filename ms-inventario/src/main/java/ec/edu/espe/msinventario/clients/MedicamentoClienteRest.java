package ec.edu.espe.msinventario.clients;

import ec.edu.espe.msinventario.models.dto.MedicamentoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-catalogo", url = "${app.clients.catalogo.url}")
public interface MedicamentoClienteRest {

    @GetMapping("/{id}")
    MedicamentoDTO buscarPorId(@PathVariable Long id);
}