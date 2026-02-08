package ec.edu.espe.msventas.repositories;

import ec.edu.espe.msventas.models.entities.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}
