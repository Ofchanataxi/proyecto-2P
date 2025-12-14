package ec.edu.espe.mscatalogo.repositories;

import ec.edu.espe.mscatalogo.models.entities.Medicamento;
import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

public interface MedicamentoRepository extends CrudRepository<Medicamento, Long> {
    // Método útil para buscar por código de barras
    Optional<Medicamento> findByCodigoBarra(String codigoBarra);
}